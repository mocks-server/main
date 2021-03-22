/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, fetch } = require("./support/helpers");

describe("when method is defined as array", () => {
  let core;

  beforeAll(async () => {
    core = await startCore("multi-methods");
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("plain mocks and routes", () => {
    describe("amounts", () => {
      it("should have two mocks", async () => {
        expect(core.mocks.plainMocks.length).toEqual(2);
      });

      it("should have two routes", async () => {
        expect(core.mocks.plainRoutes.length).toEqual(2);
      });

      it("should have four route variants", async () => {
        expect(core.mocks.plainRoutesVariants.length).toEqual(4);
      });
    });

    describe("plainMocks", () => {
      it("should return plain mocks", async () => {
        expect(core.mocks.plainMocks).toEqual([
          {
            id: "base",
            from: null,
            routesVariants: ["get-users:success", "get-user:1"],
            appliedRoutesVariants: ["get-users:success", "get-user:1"],
          },
          {
            id: "user-2",
            from: "base",
            routesVariants: ["get-user:2"],
            appliedRoutesVariants: ["get-users:success", "get-user:2"],
          },
        ]);
      });

      it("should return plain routes", async () => {
        expect(core.mocks.plainRoutes).toEqual([
          {
            id: "get-user",
            url: "/api/users/:id",
            method: ["PUT", "GET", "PATCH", "POST", "DELETE"],
            delay: null,
            variants: ["get-user:1", "get-user:2"],
          },
          {
            id: "get-users",
            url: "/api/users",
            method: "GET",
            delay: null,
            variants: ["get-users:success", "get-users:error"],
          },
        ]);
      });

      it("should return plain routesVariants", async () => {
        expect(core.mocks.plainRoutesVariants).toEqual([
          {
            id: "get-user:1",
            routeId: "get-user",
            handler: "default",
            response: {
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
            routeId: "get-user",
            handler: "default",
            response: {
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
            routeId: "get-users",
            handler: "default",
            response: {
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
            routeId: "get-users",
            handler: "default",
            response: {
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
      const users = await fetch("/api/users?req=1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path with GET method", async () => {
      const users = await fetch("/api/users/1?req=2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path with GET method", async () => {
      const users = await fetch("/api/users/2?req=3");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/1 path with PUT method", async () => {
      const users = await fetch("/api/users/1?req=2", { method: "PUT" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path with PUT method", async () => {
      const users = await fetch("/api/users/2?req=3", { method: "PUT" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/1 path with POST method", async () => {
      const users = await fetch("/api/users/1?req=4", { method: "POST" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path with PUT method", async () => {
      const users = await fetch("/api/users/2?req=5", { method: "POST" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/1 path with PATCH method", async () => {
      const users = await fetch("/api/users/1?req=6", { method: "PATCH" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path with PATCH method", async () => {
      const users = await fetch("/api/users/2?req=7", { method: "PATCH" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/1 path with DELETE method", async () => {
      const users = await fetch("/api/users/1?req=8", { method: "DELETE" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path with DELETE method", async () => {
      const users = await fetch("/api/users/2?req=9", { method: "DELETE" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('when using route variant "get-user:2"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.useRouteVariant("get-user:2");
      const users = await fetch("/api/users?req=10");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path with GET method", async () => {
      const users = await fetch("/api/users/1?req=11");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path with GET method", async () => {
      const users = await fetch("/api/users/2?req=12");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/1 path with PUT method", async () => {
      const users = await fetch("/api/users/1?req=13", { method: "PUT" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path with PUT method", async () => {
      const users = await fetch("/api/users/2?req=14", { method: "PUT" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/1 path with POST method", async () => {
      const users = await fetch("/api/users/1?req=15", { method: "POST" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path with POST method", async () => {
      const users = await fetch("/api/users/2?req=16", { method: "POST" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/1 path with PATCH method", async () => {
      const users = await fetch("/api/users/1?req=17", { method: "PATCH" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path with PATCH method", async () => {
      const users = await fetch("/api/users/2?req=6", { method: "PATCH" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/1 path with DELETE method", async () => {
      const users = await fetch("/api/users/1?req=5", { method: "DELETE" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path with DELETE method", async () => {
      const users = await fetch("/api/users/2?req=6", { method: "DELETE" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
