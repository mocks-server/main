/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, findAlert, removeConfigFile } = require("../support/helpers");

describe("when there is an error loading files", () => {
  let core;

  describe("error in mocks file", () => {
    beforeAll(async () => {
      core = await startCore("files-error-mock");
      await waitForServer();
    });

    afterAll(async () => {
      removeConfigFile();
      await core.stop();
    });

    it("should have two routes", async () => {
      expect(core.mock.routes.plain.length).toEqual(2);
    });

    it("should have four route variants", async () => {
      expect(core.mock.routes.plainVariants.length).toEqual(5);
    });

    it("should have no collections", async () => {
      expect(core.mock.collections.plain.length).toEqual(0);
    });

    it("should have added an alert about not mock found", async () => {
      expect(findAlert("mock:collections:empty", core.alerts.flat).message).toEqual(
        "No collections found"
      );
    });

    it("should have added an alert about error loading collections", async () => {
      const alert = findAlert("files:load:", core.alerts.flat);

      expect(alert.message).toEqual(expect.stringContaining("Error loading file"));
      expect(alert.message).toEqual(expect.stringContaining("collections.js"));
    });

    it("should have not added an alert about no collections file found", async () => {
      const alert = findAlert("files:loader:collections:not-found", core.alerts.flat);

      expect(alert).toBe(undefined);
    });
  });

  describe("error in routes folder", () => {
    beforeAll(async () => {
      core = await startCore("files-error-routes");
      await waitForServer();
    });

    afterAll(async () => {
      await core.stop();
    });

    it("should have three mocks", async () => {
      expect(core.mock.collections.plain.length).toEqual(3);
    });

    it("should have zero routes", async () => {
      expect(core.mock.routes.plain.length).toEqual(0);
    });

    it("should have zero route variants", async () => {
      expect(core.mock.routes.plainVariants.length).toEqual(0);
    });

    it("should have added an alert about error loading routes", async () => {
      const alert = findAlert("files:load:", core.alerts.flat);

      expect(alert.message).toEqual(expect.stringContaining("Error loading file"));
      expect(alert.message).toEqual(expect.stringContaining("user.js"));
    });

    it("collections should not have routes", () => {
      expect(core.mock.collections.plain).toEqual([
        {
          id: "base",
          from: null,
          definedRoutes: ["get-users:success", "get-user:1"],
          routes: [],
        },
        {
          id: "user-2",
          from: "base",
          definedRoutes: ["get-user:2"],
          routes: [],
        },
        {
          id: "user-real",
          from: "base",
          definedRoutes: ["get-user:real"],
          routes: [],
        },
      ]);
    });
  });
});
