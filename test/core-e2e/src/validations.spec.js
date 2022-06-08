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
  fetch,
  removeConfigFile,
} = require("./support/helpers");

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
      expect(findAlert("files:routes:file:", core.alerts).message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have loaded valid routes", () => {
      expect(core.mocks.plainRoutes.length).toEqual(1);
    });

    it("should have added an alert about mocks file loading error", () => {
      expect(findAlert("files:mocks", core.alerts).error.message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have not loaded mocks", () => {
      expect(core.mocks.plainMocks.length).toEqual(0);
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
        findAlert("mocks:loadRoutes:get-user-variant-invalid:variants:1:duplicated", core.alerts)
          .message
      ).toEqual(
        "Route variant with duplicated id '1' detected in route 'get-user-variant-invalid'. It has been ignored"
      );
    });

    it("should have added an alert about route variant not valid", () => {
      expect(
        findAlert("mocks:loadRoutes:get-user-variant-invalid:variants:2:validation", core.alerts)
          .message
      ).toEqual(
        "Variant with id '2' in route with id 'get-user-variant-invalid' is invalid: /response: type must be object. /response: instanceof must pass \"instanceof\" keyword validation. /response: oneOf must match exactly one schema in oneOf"
      );
    });

    it("should have added an alert about route duplicated", () => {
      expect(
        findAlert("mocks:loadRoutes:get-user-variant-invalid:duplicated", core.alerts).message
      ).toEqual(
        "Route with duplicated id 'get-user-variant-invalid' detected. It has been ignored"
      );
    });

    it("should have added an alert about route invalid", () => {
      expect(
        findAlert("mocks:loadRoutes:get-users-invalid:validation", core.alerts).message
      ).toEqual(
        "Route with id 'get-users-invalid' is invalid: /method: enum must be equal to one of the allowed values. /method: type must be array. /method: oneOf must match exactly one schema in oneOf"
      );
    });

    it("should have added an alert about mock routeVariant not found", () => {
      expect(findAlert("mocks:loadMocks:base:variants", core.alerts).message).toEqual(
        "Mock with id 'base' is invalid: routeVariant with id 'get-users-invalid:success' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should have added an alert about mock duplicated", () => {
      expect(findAlert("mocks:loadMocks:1:duplicated", core.alerts).message).toEqual(
        "Mock with duplicated id 'base' detected. It has been ignored"
      );
    });

    it("should have added an alert about mock routeVariant not found in mock 2", () => {
      expect(findAlert("mocks:loadMocks:invalid-variant:variants", core.alerts).message).toEqual(
        "Mock with id 'invalid-variant' is invalid: routeVariant with id 'get-user-variant-invalid:2' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should have added an alert about invalid mock 3", () => {
      expect(findAlert("mocks:loadMocks:invalid-mock:validation", core.alerts).message).toEqual(
        "Mock with id 'invalid-mock' is invalid:  must have required property 'routesVariants'"
      );
    });

    it("should have added an alert about mock with invalid from", () => {
      expect(findAlert("mocks:loadMocks:invalid-from:from", core.alerts).message).toEqual(
        "Mock with invalid 'from' property detected, 'foo' was not found"
      );
    });

    it("should have added an alert about mock with duplicated routes", () => {
      expect(findAlert("mocks:loadMocks:duplicated-route:variants", core.alerts).message).toEqual(
        "Mock with id 'duplicated-route' is invalid: route with id 'get-user' is used more than once in the same mock"
      );
    });

    it("should have added an alert about errors processing mocks", () => {
      expect(filterAlerts("mocks:loadMocks", core.alerts)[0].message).toEqual(
        "Critical errors found while loading mocks: 1"
      );
    });

    it("should have not loaded invalid routes", () => {
      expect(core.mocks.plainRoutes.length).toEqual(2);
    });

    it("should have not loaded invalid route variants", () => {
      expect(core.mocks.plainRoutesVariants.length).toEqual(3);
    });

    it("should have not loaded invalid mocks", () => {
      expect(core.mocks.plainMocks.length).toEqual(4);
    });

    it("should return user 2 at /api/users/1", async () => {
      const response = await fetch("/api/users/1");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return user 1 at /api/invalid-users/1", async () => {
      const response = await fetch("/api/invalid-users/1");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should return 404 at /api/users", async () => {
      const response = await fetch("/api/users");
      expect(response.status).toEqual(404);
    });

    it("should return user 1 at /api/invalid-users/1 when changing to mock with no valid variant", async () => {
      core.config.namespace("mocks").option("selected").value = "invalid-variant";
      const response = await fetch("/api/invalid-users/1");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
