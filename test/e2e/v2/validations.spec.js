/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, findAlert, filterAlerts, fetch } = require("./support/helpers");

describe("mocks and routes validations", () => {
  let core;

  describe("when files does not export an array", () => {
    beforeAll(async () => {
      core = await startCore("validation-not-array");
      await waitForServer();
    });

    afterAll(async () => {
      await core.stop();
    });

    it("should have added an alert about route file not exporting array", () => {
      expect(findAlert("load:routes:file:", core.alerts).message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have loaded valid routes", () => {
      expect(core.mocks.plainRoutes.length).toEqual(1);
    });

    it("should have added an alert about mocks file loading error", () => {
      expect(findAlert("load:mocks", core.alerts).error.message).toEqual(
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

    it("should have added an alert about route variant not valid", () => {
      expect(filterAlerts("validation:route:", core.alerts)[0].message).toEqual(
        'Variant with id "2" in route with id "get-user-variant-invalid" is invalid: Property "response" should be an object or a function'
      );
    });

    it("should have added an alert about route not valid", () => {
      expect(filterAlerts("validation:route:", core.alerts)[1].message).toEqual(
        'Route with id "get-users-invalid" is invalid: Property "method" should be a string or an array with unique items. Allowed values for "method" are "GET,POST,PATCH,DELETE,PUT,OPTIONS,HEAD,TRACE"'
      );
    });

    it("should have added an alert about base mock not valid", () => {
      expect(filterAlerts("validation:mock:", core.alerts)[0].message).toEqual(
        'Mock with id "base" is invalid: routeVariant with id "get-users-invalid:success" was not found, use a valid "routeId:variantId" identifier'
      );
    });

    it("should have added an alerts about invalid-variant mock not valid", () => {
      expect(filterAlerts("validation:mock:", core.alerts)[1].message).toEqual(
        'Mock with id "invalid-variant" is invalid: routeVariant with id "get-user-variant-invalid:2" was not found, use a valid "routeId:variantId" identifier'
      );
    });

    it("should have added an alerts about invalid-mock mock not valid", () => {
      expect(filterAlerts("validation:mock:", core.alerts)[2].message).toEqual(
        'Mock with id "invalid-mock" is invalid: Should have a property "routesVariants"'
      );
    });

    it("should have not loaded invalid routes", () => {
      expect(core.mocks.plainRoutes.length).toEqual(2);
    });

    it("should have not loaded invalid route variants", () => {
      expect(core.mocks.plainRoutesVariants.length).toEqual(3);
    });

    it("should have not loaded invalid mocks", () => {
      expect(core.mocks.plainMocks.length).toEqual(2);
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
      core.settings.set("mock", "invalid-variant");
      const response = await fetch("/api/invalid-users/1");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
