/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServerAndCli,
  wait,
  cleanScaffold,
} = require("./support/helpers");

describe("scaffold", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    await cleanScaffold();
    mocks = mocksRunner([]);
    await waitForServerAndCli();
  });

  afterAll(async () => {
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 4 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 4"));
    });

    it("should not display behaviors", async () => {
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("behaviors"));
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
  });

  describe("mock collections api", () => {
    it("should return collections", async () => {
      const response = await doFetch("/api/mock/collections", {
        port: 3110,
      });
      expect(response.body).toEqual([
        {
          id: "base",
          from: null,
          definedRoutes: ["add-headers:enabled", "get-users:success", "get-user:success"],
          routes: ["add-headers:enabled", "get-users:success", "get-user:success"],
        },
        {
          id: "no-headers",
          from: "base",
          definedRoutes: ["add-headers:disabled"],
          routes: ["add-headers:disabled", "get-users:success", "get-user:success"],
        },
        {
          id: "all-users",
          from: "base",
          definedRoutes: ["get-users:all", "get-user:id-3"],
          routes: ["add-headers:enabled", "get-users:all", "get-user:id-3"],
        },
        {
          id: "user-real",
          from: "no-headers",
          definedRoutes: ["get-user:real"],
          routes: ["add-headers:disabled", "get-users:success", "get-user:real"],
        },
      ]);
    });
  });

  describe("mock routes api", () => {
    it("should return routes", async () => {
      const response = await doFetch("/api/mock/routes", {
        port: 3110,
      });
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
    it("should return route variants", async () => {
      const response = await doFetch("/api/mock/variants", {
        port: 3110,
      });
      expect(response.body).toEqual([
        {
          id: "add-headers:enabled",
          disabled: false,
          route: "add-headers",
          type: "middleware",
          preview: null,
          delay: null,
        },
        {
          id: "add-headers:disabled",
          preview: null,
          type: null,
          disabled: true,
          route: "add-headers",
          delay: null,
        },
        {
          id: "get-users:success",
          disabled: false,
          route: "get-users",
          type: "json",
          preview: {
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
          disabled: false,
          route: "get-users",
          type: "json",
          preview: {
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
          disabled: false,
          route: "get-users",
          type: "json",
          preview: { body: { message: "Error" }, status: 400 },
          delay: null,
        },
        {
          id: "get-user:success",
          disabled: false,
          route: "get-user",
          type: "json",
          preview: { body: { id: 1, name: "John Doe" }, status: 200 },
          delay: null,
        },
        {
          id: "get-user:id-3",
          disabled: false,
          route: "get-user",
          type: "json",
          preview: { body: { id: 3, name: "Tommy" }, status: 200 },
          delay: null,
        },
        {
          id: "get-user:real",
          disabled: false,
          route: "get-user",
          type: "middleware",
          preview: null,
          delay: null,
        },
      ]);
    });
  });

  describe('When changing current collection to "user-real"', () => {
    it("should display new selected collection", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown(3);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current collection: user-real"));
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
    it("should display custom route variant", async () => {
      await mocks.cursorDown();
      await mocks.pressEnter();
      await mocks.cursorDown(5);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(
        expect.stringContaining(
          "Current collection: user-real (custom variants: get-user:success)"
        )
      );
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
    it("should display collection", async () => {
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current collection: user-real"));
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

  describe("when using api to change current collection", () => {
    beforeAll(async () => {
      await doFetch("/api/config", {
        port: 3110,
        method: "PATCH",
        body: {
          mock: {
            collections: {
              selected: "base",
            },
          },
        },
      });
    });

    it("should return new collection when getting config", async () => {
      const settingsResponse = await doFetch("/api/config", {
        port: 3110,
      });
      expect(settingsResponse.body.mock.collections.selected).toEqual("base");
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should display new mock in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current collection: base"));
    });
  });

  describe("when using api to set route variant", () => {
    beforeAll(async () => {
      await doFetch("/api/mock/custom-route-variants", {
        port: 3110,
        method: "POST",
        body: {
          id: "get-user:real",
        },
      });
    });

    it("should display custom route variant in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("Current collection: base (custom variants: get-user:real)")
      );
    });

    it("should return custom route variant in API", async () => {
      const response = await doFetch("/api/mock/custom-route-variants", {
        port: 3110,
      });
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
      await doFetch("/api/mock/custom-route-variants", {
        port: 3110,
        method: "DELETE",
      });
    });

    it("should not display custom route variant in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current collection: base"));
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("(custom variants:"));
    });

    it("should return custom route variants in API", async () => {
      const response = await doFetch("/api/mock/custom-route-variants", {
        port: 3110,
      });
      expect(response.body).toEqual([]);
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
