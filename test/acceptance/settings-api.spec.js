/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request, fixturesFolder, TimeCounter, wait } = require("./utils");

describe("settings api", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial");
  });

  afterAll(() => {
    stopServer(server);
  });

  describe("get", () => {
    it("should return current settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse).toEqual({
        behavior: "standard",
        path: fixturesFolder("web-tutorial"),
        delay: 0,
        host: "0.0.0.0",
        port: 3100,
        watch: false,
        log: "silly",
        adminApiPath: "/admin",
        adminApiDeprecatedPaths: true
      });
    });
  });

  describe("patch", () => {
    describe("when changing delay option", () => {
      it("should respond with no delay", async () => {
        const timeCounter = new TimeCounter();
        await request("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeLessThan(200);
      });

      it("should set delay option and have effect on server response time", async () => {
        const timeCounter = new TimeCounter();
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            delay: 2000
          }
        });
        await request("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeGreaterThan(2000);
      });

      it("should set delay option to 0", async () => {
        const timeCounter = new TimeCounter();
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            delay: 0
          }
        });
        await request("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeLessThan(200);
      });
    });

    describe("when changing behavior option", () => {
      describe("without changing it", () => {
        it("should serve user 1 under the /api/users/1 path", async () => {
          const users = await request("/api/users/1");
          expect(users).toEqual({ id: 1, name: "John Doe" });
        });

        it("should serve user 1 under the /api/users/2 path", async () => {
          const users = await request("/api/users/2");
          expect(users).toEqual({ id: 1, name: "John Doe" });
        });
      });

      describe('changing it to "user2"', () => {
        beforeAll(async () => {
          await request("/admin/settings", {
            method: "PATCH",
            body: {
              behavior: "user2"
            }
          });
        });

        it("should return new behavior when getting settings", async () => {
          const settingsResponse = await request("/admin/settings");
          expect(settingsResponse.behavior).toEqual("user2");
        });

        it("should serve user 2 under the /api/users/1 path", async () => {
          const users = await request("/api/users/1");
          expect(users).toEqual({ id: 2, name: "Jane Doe" });
        });

        it("should serve user 2 under the /api/users/2 path", async () => {
          const users = await request("/api/users/2");
          expect(users).toEqual({ id: 2, name: "Jane Doe" });
        });
      });
    });

    describe("when changing path option", () => {
      beforeAll(async () => {
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            path: fixturesFolder("files-modification")
          }
        });
        await wait(1000);
      });

      afterAll(async () => {
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            path: fixturesFolder("web-tutorial")
          }
        });
        await wait(1000);
      });

      it("should return new path option when getting settings", async () => {
        const settingsResponse = await request("/admin/settings");
        expect(settingsResponse.path).toEqual(fixturesFolder("files-modification"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" }
        ]);
      });
    });

    describe("when changing port option", () => {
      beforeAll(async () => {
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            port: 3101
          }
        });
        await wait(1000);
      });

      afterAll(async () => {
        await request("/admin/settings", {
          port: 3101,
          method: "PATCH",
          body: {
            port: 3100
          }
        });
        await wait(1000);
      });

      it("should return new port option when getting settings, using new port", async () => {
        const settingsResponse = await request("/admin/settings", {
          port: 3101
        });
        expect(settingsResponse.port).toEqual(3101);
      });

      it("should serve user 2 under the /api/users/1 path using new port", async () => {
        const users = await request("/api/users/1", {
          port: 3101
        });
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
      });
    });

    describe("when changing adminApiPath option", () => {
      beforeAll(async () => {
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            adminApiPath: "/administration"
          }
        });
        await wait(1000);
      });

      afterAll(async () => {
        await request("/administration/settings", {
          method: "PATCH",
          body: {
            adminApiPath: "/admin"
          }
        });
        await wait(1000);
      });

      it("should return new port adminApiPath when getting settings, using new admin api path", async () => {
        const settingsResponse = await request("/administration/settings");
        expect(settingsResponse.adminApiPath).toEqual("/administration");
      });

      it("should return not found adminApiPath when getting settings in old admin api path", async () => {
        const settingsResponse = await request("/admin/settings", {
          resolveWithFullResponse: true,
          simple: false
        });
        expect(settingsResponse.statusCode).toEqual(404);
      });
    });

    describe("without changing adminApiDeprecatedPaths option", () => {
      it("should return current delay option in deprecated api path", async () => {
        const settingsResponse = await request("/mocks/settings");
        expect(settingsResponse).toEqual({
          delay: 0
        });
      });
    });

    describe("when changing adminApiDeprecatedPaths option", () => {
      beforeAll(async () => {
        await request("/admin/settings", {
          method: "PATCH",
          body: {
            adminApiDeprecatedPaths: false
          }
        });
        await wait(1000);
      });

      it("should return not found when getting settings in deprecated admin api path", async () => {
        const settingsResponse = await request("/mocks/settings", {
          resolveWithFullResponse: true,
          simple: false
        });
        expect(settingsResponse.statusCode).toEqual(404);
      });
    });
  });
});
