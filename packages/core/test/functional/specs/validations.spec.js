/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  waitForServer,
  findAlert,
  filterAlerts,
  doFetch,
  removeConfigFile,
} = require("../support/helpers");

describe("mocks and routes validations", () => {
  let core;

  describe("when files does not export an array", () => {
    beforeAll(async () => {
      core = await startCore("validation-not-array");
      await waitForServer();
    });

    afterAll(async () => {
      removeConfigFile();
      await core.stop();
    });

    it("should have added an alert about route file not exporting array", () => {
      expect(findAlert("files:loader:routes:file:", core.alerts.flat).message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have loaded valid routes", () => {
      expect(core.mock.routes.plain.length).toEqual(1);
    });

    it("should have added an alert about collections file loading error", () => {
      expect(findAlert("files:loader:collections", core.alerts.flat).error.message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have not loaded collections", () => {
      expect(core.mock.collections.plain.length).toEqual(0);
    });
  });

  describe("when routes are not valid", () => {
    beforeAll(async () => {
      core = await startCore("validations");
      await waitForServer();
    });

    afterAll(async () => {
      await core.stop();
    });

    it("should have added an alert about route variant with duplicated id", () => {
      expect(
        findAlert(
          "mock:routes:load:get-user-variant-invalid:variants:1:duplicated",
          core.alerts.flat
        ).message
      ).toEqual(
        "Route variant with duplicated id '1' detected in route 'get-user-variant-invalid'. It has been ignored"
      );
    });

    it("should have added an alert about route variant not valid", () => {
      expect(
        findAlert(
          "mock:routes:load:get-user-variant-invalid:variants:2:validation",
          core.alerts.flat
        ).message
      ).toEqual(
        "Variant with id '2' in route with id 'get-user-variant-invalid' is invalid: Invalid 'options' property: must have required property 'body'"
      );
    });

    it("should have added an alert about route duplicated", () => {
      expect(
        findAlert("mock:routes:load:get-user-variant-invalid:duplicated", core.alerts.flat).message
      ).toEqual(
        "Route with duplicated id 'get-user-variant-invalid' detected. It has been ignored"
      );
    });

    it("should have added an alert about route invalid", () => {
      expect(
        findAlert("mock:routes:load:get-users-invalid:validation", core.alerts.flat).message
      ).toEqual(
        "Route with id 'get-users-invalid' is invalid: /method: enum must be equal to one of the allowed values. /method: type must be array. /method: oneOf must match exactly one schema in oneOf"
      );
    });

    it("should have added an alert about mock routeVariant not found", () => {
      expect(findAlert("mock:collections:load:base:variants", core.alerts.flat).message).toEqual(
        "Collection with id 'base' is invalid: routeVariant with id 'get-users-invalid:success' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should have added an alert about mock duplicated", () => {
      expect(findAlert("mock:collections:load:1:duplicated", core.alerts.flat).message).toEqual(
        "Collection with duplicated id 'base' detected. It has been ignored"
      );
    });

    it("should have added an alert about mock routeVariant not found in mock 2", () => {
      expect(
        findAlert("mock:collections:load:invalid-variant:variants", core.alerts.flat).message
      ).toEqual(
        "Collection with id 'invalid-variant' is invalid: routeVariant with id 'get-user-variant-invalid:2' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should have added an alert about invalid mock 3", () => {
      expect(
        findAlert("mock:collections:load:invalid-mock:validation", core.alerts.flat).message
      ).toEqual(
        "Collection with id 'invalid-mock' is invalid:  must have required property 'routes'"
      );
    });

    it("should have added an alert about Collection with invalid from", () => {
      expect(
        findAlert("mock:collections:load:invalid-from:from", core.alerts.flat).message
      ).toEqual("Collection with invalid 'from' property detected, 'foo' was not found");
    });

    it("should have added an alert about Collection with duplicated routes", () => {
      expect(
        findAlert("mock:collections:load:duplicated-route:variants", core.alerts.flat).message
      ).toEqual(
        "Collection with id 'duplicated-route' is invalid: route with id 'get-user' is used more than once in the same collection"
      );
    });

    it("should have added an alert about errors processing mocks", () => {
      expect(filterAlerts("mock:collections:load", core.alerts.flat)[0].message).toEqual(
        "Critical errors found while loading collections: 1"
      );
    });

    it("should have not loaded invalid routes", () => {
      expect(core.mock.routes.plain.length).toEqual(3);
    });

    it("should have not loaded invalid route variants", () => {
      expect(core.mock.routes.plainVariants.length).toEqual(3);
    });

    it("should have not loaded invalid mocks", () => {
      expect(core.mock.collections.plain.length).toEqual(4);
    });

    it("should return user 2 at /api/users/1", async () => {
      const response = await doFetch("/api/users/1");

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return user 1 at /api/invalid-users/1", async () => {
      const response = await doFetch("/api/invalid-users/1");

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should return 404 at /api/users", async () => {
      const response = await doFetch("/api/users");

      expect(response.status).toEqual(404);
    });

    it("should return user 1 at /api/invalid-users/1 when changing to Collection with no valid variant", async () => {
      core.config.namespace("mock").namespace("collections").option("selected").value =
        "invalid-variant";
      const response = await doFetch("/api/invalid-users/1");

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
