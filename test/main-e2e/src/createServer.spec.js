/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { createServer } = require("@mocks-server/main");

const { doFetch, waitForServer, cleanRootScaffold } = require("./support/helpers");

describe("createServer", () => {
  jest.setTimeout(15000);
  let server;

  beforeAll(async () => {
    await cleanRootScaffold();
    server = createServer({
      files: {
        enabled: true,
      },
    });
    await server.start();
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("When started", () => {
    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("mocks api", () => {
    it("should return mocks", async () => {
      const response = await doFetch("/admin/mocks");
      expect(response.body).toEqual([
        {
          id: "base",
          from: null,
          routesVariants: ["add-headers:enabled", "get-users:success", "get-user:success"],
          appliedRoutesVariants: ["add-headers:enabled", "get-users:success", "get-user:success"],
        },
        {
          id: "no-headers",
          from: "base",
          routesVariants: ["add-headers:disabled"],
          appliedRoutesVariants: ["add-headers:disabled", "get-users:success", "get-user:success"],
        },
        {
          id: "all-users",
          from: "base",
          routesVariants: ["get-users:all", "get-user:id-3"],
          appliedRoutesVariants: ["add-headers:enabled", "get-users:all", "get-user:id-3"],
        },
        {
          id: "user-real",
          from: "no-headers",
          routesVariants: ["get-user:real"],
          appliedRoutesVariants: ["add-headers:disabled", "get-users:success", "get-user:real"],
        },
      ]);
    });
  });

  describe("routes api", () => {
    it("should return routes", async () => {
      const response = await doFetch("/admin/routes");
      expect(response.body).toEqual([
        {
          id: "add-headers",
          url: "*",
          method: ["get", "post", "put", "patch"],
          delay: null,
          variants: ["add-headers:enabled", "add-headers:disabled"],
        },
        {
          id: "get-users",
          url: "/api/users",
          method: "get",
          delay: null,
          variants: ["get-users:success", "get-users:all", "get-users:error"],
        },
        {
          id: "get-user",
          url: "/api/users/:id",
          method: "get",
          delay: null,
          variants: ["get-user:success", "get-user:id-3", "get-user:real"],
        },
      ]);
    });
  });

  describe("routes variants api", () => {
    it("should return routes variants", async () => {
      const response = await doFetch("/admin/routes-variants");
      expect(response.body).toEqual([
        {
          id: "add-headers:enabled",
          routeId: "add-headers",
          handler: "middleware",
          response: null,
          delay: null,
        },
        {
          id: "add-headers:disabled",
          routeId: "add-headers",
          handler: "middleware",
          response: null,
          delay: null,
        },
        {
          id: "get-users:success",
          routeId: "get-users",
          handler: "json",
          response: {
            body: [
              { id: 1, name: "John Doe" },
              { id: 2, name: "Jane Doe" },
            ],
            status: 200,
          },
          delay: null,
        },
        {
          id: "get-users:all",
          routeId: "get-users",
          handler: "json",
          response: {
            body: [
              { id: 1, name: "John Doe" },
              { id: 2, name: "Jane Doe" },
              { id: 3, name: "Tommy" },
              { id: 4, name: "Timmy" },
            ],
            status: 200,
          },
          delay: null,
        },
        {
          id: "get-users:error",
          routeId: "get-users",
          handler: "json",
          response: { body: { message: "Error" }, status: 400 },
          delay: null,
        },
        {
          id: "get-user:success",
          routeId: "get-user",
          handler: "json",
          response: { body: { id: 1, name: "John Doe" }, status: 200 },
          delay: null,
        },
        {
          id: "get-user:id-3",
          routeId: "get-user",
          handler: "json",
          response: { body: { id: 3, name: "Tommy" }, status: 200 },
          delay: null,
        },
        {
          id: "get-user:real",
          routeId: "get-user",
          handler: "middleware",
          response: null,
          delay: null,
        },
      ]);
    });
  });

  describe('When changing current collection to "user-real"', () => {
    beforeAll(() => {
      server.mock.collections.select("user-real");
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await doFetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("When setting custom route variant", () => {
    beforeAll(() => {
      server.mock.useRouteVariant("get-user:success");
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should return user 2 for /api/users/3 path", async () => {
      const users = await doFetch("/api/users/3");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("When restoring route variants", () => {
    beforeAll(() => {
      server.mock.restoreRouteVariants();
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await doFetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("when using api to change current mock", () => {
    beforeAll(async () => {
      await doFetch("/admin/settings", {
        method: "PATCH",
        body: {
          mocks: {
            selected: "base",
          },
        },
      });
    });

    it("should return new mock when getting settings", async () => {
      const settingsResponse = await doFetch("/admin/settings");
      expect(settingsResponse.body.mocks.selected).toEqual("base");
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("when using api to set route variant", () => {
    beforeAll(async () => {
      await doFetch("/admin/mock-custom-routes-variants", {
        method: "POST",
        body: {
          id: "get-user:real",
        },
      });
    });

    it("should return custom route variant in API", async () => {
      const response = await doFetch("/admin/mock-custom-routes-variants");
      expect(response.body).toEqual(["get-user:real"]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await doFetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("when using api to restore routes variants", () => {
    beforeAll(async () => {
      await doFetch("/admin/mock-custom-routes-variants", {
        method: "DELETE",
      });
    });

    it("should return custom route variants in API", async () => {
      const response = await doFetch("/admin/mock-custom-routes-variants");
      expect(response.body).toEqual([]);
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
