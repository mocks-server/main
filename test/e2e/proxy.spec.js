/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  fetch,
  waitForServerAndCli,
  wait,
  fixturesFolder,
} = require("./support/helpers");

describe("scaffold", () => {
  jest.setTimeout(15000);
  let mocks, host;

  beforeAll(async () => {
    host = mocksRunner(["--port=3200"]);
    mocks = mocksRunner(["--port=3100"], { cwd: fixturesFolder("proxy") });
    await waitForServerAndCli();
    await waitForServerAndCli(3200);
  });

  afterAll(async () => {
    await host.kill();
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 2 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Mocks: 2"));
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
          from: null,
          routesVariants: ["proxy-all:enabled"],
          appliedRoutesVariants: ["proxy-all:enabled"],
        },
        {
          id: "proxy-disabled",
          from: null,
          routesVariants: ["proxy-all:disabled"],
          appliedRoutesVariants: ["proxy-all:disabled"],
        },
      ]);
    });
  });

  describe("routes api", () => {
    it("should return routes", async () => {
      const response = await fetch("/admin/routes");
      expect(response.body).toEqual([
        {
          id: "proxy-all",
          url: "*",
          delay: null,
          method: ["GET", "POST", "PATCH", "PUT"],
          variants: ["proxy-all:enabled", "proxy-all:disabled"],
        },
      ]);
    });
  });

  describe("routes variants api", () => {
    it("should return routes variants", async () => {
      const response = await fetch("/admin/routes-variants");
      expect(response.body).toEqual([
        {
          id: "proxy-all:enabled",
          routeId: "proxy-all",
          handler: "proxy",
          response: {
            host: "http://127.0.0.1:3200",
          },
          delay: null,
        },
        {
          id: "proxy-all:disabled",
          routeId: "proxy-all",
          handler: "default",
          response: "function",
          delay: null,
        },
      ]);
    });
  });

  describe('When changing current mock to "disabled"', () => {
    it("should display new selected mock", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown(1);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: proxy-disabled"));
    });

    it("should return not found for /api/users path", async () => {
      const usersResponse = await fetch("/api/users");
      expect(usersResponse.status).toEqual(404);
    });

    it("should return not found for /api/users/2 path", async () => {
      const usersResponse = await fetch("/api/users/2");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("When setting custom route variant", () => {
    it("should display custom route variant", async () => {
      await mocks.cursorDown();
      await mocks.pressEnter();
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(
        expect.stringContaining(
          "Current mock: proxy-disabled (custom variants: proxy-all:enabled)"
        )
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
  });

  describe("when using api to restore routes variants", () => {
    beforeAll(async () => {
      await fetch("/admin/mock-custom-routes-variants", {
        method: "DELETE",
      });
    });

    it("should not display custom route variant in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: proxy-disabled"));
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("(custom variants:"));
    });

    it("should return custom route variants in API", async () => {
      const response = await fetch("/admin/mock-custom-routes-variants");
      expect(response.body).toEqual([]);
    });

    it("should return not found for /api/users path", async () => {
      const usersResponse = await fetch("/api/users");
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

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should display new mock in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: base"));
    });
  });
});