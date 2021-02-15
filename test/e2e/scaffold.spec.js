/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServerAndCli, wait } = require("./support/helpers");

describe("scaffold", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    mocks = mocksRunner();
    await waitForServerAndCli();
  });

  afterAll(async () => {
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 3 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Mocks: 3"));
    });

    it("should not display behaviors", async () => {
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("behaviors"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("mocks api", () => {
    it("should return mocks", async () => {
      const response = await fetch("/admin/mocks");
      expect(response.body).toEqual([
        {
          id: "base",
          routesVariants: ["add-headers:enabled", "get-users:success", "get-user:success"],
        },
        {
          id: "no-headers",
          routesVariants: ["add-headers:disabled", "get-users:success", "get-user:success"],
        },
        {
          id: "user-real",
          routesVariants: ["add-headers:disabled", "get-users:success", "get-user:real"],
        },
      ]);
    });
  });

  describe("routes api", () => {
    it("should return routes", async () => {
      const response = await fetch("/admin/routes");
      expect(response.body).toEqual([
        {
          id: "add-headers",
          url: "*",
          method: "GET",
          variants: ["add-headers:enabled", "add-headers:disabled"],
        },
        {
          id: "get-users",
          url: "/api/users",
          method: "GET",
          variants: ["get-users:success", "get-users:error"],
        },
        {
          id: "get-user",
          url: "/api/users/:id",
          method: "GET",
          variants: ["get-user:success", "get-user:real"],
        },
      ]);
    });
  });

  describe("routes variants api", () => {
    it("should return routes variants", async () => {
      const response = await fetch("/admin/routes-variants");
      expect(response.body).toEqual([
        {
          id: "add-headers:enabled",
          routeId: "add-headers",
          handler: "default",
          response: "function",
          delay: null,
        },
        {
          id: "add-headers:disabled",
          routeId: "add-headers",
          handler: "default",
          response: "function",
          delay: null,
        },
        {
          id: "get-users:success",
          routeId: "get-users",
          handler: "default",
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
          id: "get-users:error",
          routeId: "get-users",
          handler: "default",
          response: { body: { message: "Error" }, status: 400 },
          delay: null,
        },
        {
          id: "get-user:success",
          routeId: "get-user",
          handler: "default",
          response: { body: { id: 1, name: "John Doe" }, status: 200 },
          delay: null,
        },
        {
          id: "get-user:real",
          routeId: "get-user",
          handler: "default",
          response: "function",
          delay: null,
        },
      ]);
    });
  });

  describe('When changing current mock to "user-real"', () => {
    it("should display new selected mock", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: user-real"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await fetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("When setting custom route variant", () => {
    it("should display custom route variant", async () => {
      await mocks.cursorDown();
      await mocks.pressEnter();
      await mocks.cursorDown(4);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(
        expect.stringContaining("Current mock: user-real (custom variants: get-user:success)")
      );
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should return user 2 for /api/users/3 path", async () => {
      const users = await fetch("/api/users/3");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("When restoring route variants", () => {
    it("should display mock", async () => {
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: user-real"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await fetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("when using api to change current mock", () => {
    beforeAll(async () => {
      await fetch("/admin/settings", {
        method: "PATCH",
        body: {
          mock: "base",
        },
      });
    });

    it("should return new mock when getting settings", async () => {
      const settingsResponse = await fetch("/admin/settings");
      expect(settingsResponse.body.mock).toEqual("base");
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should display new mock in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: base"));
    });
  });

  describe("when using api to set route variant", () => {
    beforeAll(async () => {
      await fetch("/admin/mock-custom-routes-variants", {
        method: "POST",
        body: {
          id: "get-user:real",
        },
      });
    });

    it("should display custom route variant in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("Current mock: base (custom variants: get-user:real)")
      );
    });

    it("should return custom route variant in API", async () => {
      const response = await fetch("/admin/mock-custom-routes-variants");
      expect(response.body).toEqual(["get-user:real"]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await fetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("when using api to restore routes variants", () => {
    beforeAll(async () => {
      await fetch("/admin/mock-custom-routes-variants", {
        method: "DELETE",
      });
    });

    it("should not display custom route variant in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: base"));
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("(custom variants:"));
    });

    it("should return custom route variants in API", async () => {
      const response = await fetch("/admin/mock-custom-routes-variants");
      expect(response.body).toEqual([]);
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
