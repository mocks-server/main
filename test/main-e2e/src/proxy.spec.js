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
  fixturesFolder,
} = require("./support/helpers");

describe("scaffold", () => {
  jest.setTimeout(15000);
  let mocks, host;

  beforeAll(async () => {
    host = mocksRunner(["--server.port=3200", "--plugins.adminApi.port=3210"]);
    mocks = mocksRunner(["--server.port=3100"], { cwd: fixturesFolder("proxy") });
    await waitForServerAndCli();
    await waitForServerAndCli(3200);
  });

  afterAll(async () => {
    await host.kill();
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 2 collections available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 2"));
    });

    it("should not display alerts", async () => {
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
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

  describe("collections api", () => {
    it("should return collections", async () => {
      const response = await doFetch("/api/mock/collections", {
        port: 3110,
      });
      expect(response.body).toEqual([
        {
          id: "base",
          from: null,
          routes: ["proxy-all:enabled"],
          definedRoutes: ["proxy-all:enabled"],
        },
        {
          id: "proxy-disabled",
          from: null,
          routes: ["proxy-all:disabled"],
          definedRoutes: ["proxy-all:disabled"],
        },
      ]);
    });
  });

  describe("routes api", () => {
    it("should return routes", async () => {
      const response = await doFetch("/api/mock/routes", {
        port: 3110,
      });
      expect(response.body).toEqual([
        {
          id: "proxy-all",
          url: "*",
          delay: null,
          method: ["get", "post", "patch", "put"],
          variants: ["proxy-all:enabled", "proxy-all:disabled"],
        },
      ]);
    });
  });

  describe("route variants api", () => {
    it("should return route variants", async () => {
      const response = await doFetch("/api/mock/variants", {
        port: 3110,
      });
      expect(response.body).toEqual([
        {
          id: "proxy-all:enabled",
          route: "proxy-all",
          type: "proxy",
          disabled: false,
          preview: null,
          delay: null,
        },
        {
          id: "proxy-all:disabled",
          route: "proxy-all",
          type: "middleware",
          disabled: false,
          preview: null,
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
      expect(newScreen).toEqual(expect.stringContaining("Current collection: proxy-disabled"));
    });

    it("should return not found for /api/users path", async () => {
      const usersResponse = await doFetch("/api/users");
      expect(usersResponse.status).toEqual(404);
    });

    it("should return not found for /api/users/2 path", async () => {
      const usersResponse = await doFetch("/api/users/2");
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
          "Current collection: proxy-disabled (custom variants: proxy-all:enabled)"
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
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("Current collection: proxy-disabled")
      );
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("(custom variants:"));
    });

    it("should return custom route variants in API", async () => {
      const response = await doFetch("/api/mock/custom-route-variants", {
        port: 3110,
      });
      expect(response.body).toEqual([]);
    });

    it("should return not found for /api/users path", async () => {
      const usersResponse = await doFetch("/api/users");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("when using api to change current mock", () => {
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

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should display new mock in CLI", async () => {
      await wait(500);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current collection: base"));
    });
  });
});
