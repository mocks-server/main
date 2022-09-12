/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, doFetch, removeConfigFile } = require("../support/helpers");

describe("when method is defined as array", () => {
  let requestNumber = 1;
  let core;

  beforeAll(async () => {
    // disable cors to test custom options method
    core = await startCore("multi-methods", {
      server: { cors: { options: { preflightContinue: true } } },
      log: "debug",
    });
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("plain collections and routes", () => {
    describe("amounts", () => {
      it("should have two collections", async () => {
        expect(core.mock.collections.plain.length).toEqual(2);
      });

      it("should have two routes", async () => {
        expect(core.mock.routes.plain.length).toEqual(2);
      });

      it("should have four route variants", async () => {
        expect(core.mock.routes.plainVariants.length).toEqual(4);
      });
    });

    describe("collections.plain", () => {
      it("should return plain collections", async () => {
        expect(core.mock.collections.plain).toEqual([
          {
            id: "base",
            from: null,
            definedRoutes: ["get-users:success", "get-user:1"],
            routes: ["get-users:success", "get-user:1"],
          },
          {
            id: "user-2",
            from: "base",
            definedRoutes: ["get-user:2"],
            routes: ["get-users:success", "get-user:2"],
          },
        ]);
      });

      it("should return plain routes", async () => {
        expect(core.mock.routes.plain).toEqual([
          {
            id: "get-user",
            url: "/api/users/:id",
            method: ["put", "get", "patch", "post", "delete", "options", "head", "trace"],
            delay: null,
            variants: ["get-user:1", "get-user:2"],
          },
          {
            id: "get-users",
            url: "/api/users",
            method: "get",
            delay: null,
            variants: ["get-users:success", "get-users:error"],
          },
        ]);
      });

      it("should return plain routesVariants", async () => {
        expect(core.mock.routes.plainVariants).toEqual([
          {
            id: "get-user:1",
            route: "get-user",
            type: "json",
            disabled: false,
            preview: {
              body: {
                id: 1,
                name: "John Doe",
              },
              status: 200,
            },
            delay: null,
          },
          {
            id: "get-user:2",
            route: "get-user",
            type: "json",
            disabled: false,
            preview: {
              body: {
                id: 2,
                name: "Jane Doe",
              },
              status: 200,
            },
            delay: null,
          },
          {
            id: "get-users:success",
            route: "get-users",
            type: "json",
            disabled: false,
            preview: {
              body: [
                {
                  id: 1,
                  name: "John Doe",
                },
                {
                  id: 2,
                  name: "Jane Doe",
                },
              ],
              status: 200,
            },
            delay: null,
          },
          {
            id: "get-users:error",
            route: "get-users",
            type: "json",
            disabled: false,
            preview: {
              body: {
                message: "Bad data",
              },
              status: 403,
            },
            delay: null,
          },
        ]);
      });
    });
  });

  describe("base mock", () => {
    it("should serve users under the /api/users path", async () => {
      const users = await doFetch("/api/users?req=1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    const testMethod = (method, id, expectBody = true) => {
      it(`should serve user 1 under the /api/users/${id} path with ${method} method`, async () => {
        const users = await doFetch(`/api/users/${id}?req=${requestNumber}`, { method });
        requestNumber++;
        expect(users.status).toEqual(200);
        if (expectBody) {
          expect(users.body).toEqual({ id: 1, name: "John Doe" });
        }
      });
    };

    testMethod("GET", "1");
    testMethod("GET", "2");
    testMethod("PUT", "1");
    testMethod("PUT", "2");
    testMethod("POST", "1");
    testMethod("POST", "2");
    testMethod("PATCH", "1");
    testMethod("PATCH", "2");
    testMethod("DELETE", "1");
    testMethod("DELETE", "2");
    testMethod("OPTIONS", "1");
    testMethod("OPTIONS", "2");
    testMethod("HEAD", "1", false);
    testMethod("HEAD", "2", false);
    testMethod("TRACE", "1");
    testMethod("TRACE", "2");
  });

  describe('when using route variant "get-user:2"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mock.useRouteVariant("get-user:2");
      const users = await doFetch("/api/users?req=10");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    const testMethod = (method, id, expectBody = true) => {
      it(`should serve user 2 under the /api/users/${id} path with ${method} method`, async () => {
        const users = await doFetch(`/api/users/${id}?req=${requestNumber}`, { method });
        requestNumber++;
        expect(users.status).toEqual(200);
        if (expectBody) {
          expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
        }
      });
    };

    testMethod("GET", "1");
    testMethod("GET", "2");
    testMethod("PUT", "1");
    testMethod("PUT", "2");
    testMethod("POST", "1");
    testMethod("POST", "2");
    testMethod("PATCH", "1");
    testMethod("PATCH", "2");
    testMethod("DELETE", "1");
    testMethod("DELETE", "2");
    testMethod("OPTIONS", "1");
    testMethod("OPTIONS", "2");
    testMethod("HEAD", "1", false);
    testMethod("HEAD", "2", false);
    testMethod("TRACE", "1");
    testMethod("TRACE", "2");
  });
});
