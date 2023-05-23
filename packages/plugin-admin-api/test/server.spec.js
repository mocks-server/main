/*
Copyright 2020-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startServer,
  doFetch,
  doApiFetch,
  fixturesFolder,
  wait,
  waitForServer,
} = require("./support/helpers");

describe("server", () => {
  let server, hostOption, portOption;
  beforeAll(async () => {
    server = await startServer("web-tutorial", { log: "silly" });
    hostOption = server.config.namespace("plugins").namespace("adminApi").option("host");
    portOption = server.config.namespace("plugins").namespace("adminApi").option("port");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("when started", () => {
    it("should return current config", async () => {
      const response = await doApiFetch("/config");
      expect(response.body.files.path).toEqual(fixturesFolder("web-tutorial"));
    });
  });

  describe("when stopped", () => {
    it("should not respond when requesting setting", async () => {
      await server._stopPlugins();
      await waitForServer();
      const error = await doApiFetch("/config").catch((err) => Promise.resolve(err));
      expect(error.message).toEqual(expect.stringContaining("ECONNREFUSED"));
    });

    it("should respond to mock requests", async () => {
      await server._stopPlugins();
      const response = await doFetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });

  describe("when collection is changed", () => {
    it("should respond with new collection", async () => {
      server.config.set({
        mock: {
          collections: {
            selected: "user-2",
          },
        },
      });
      await wait(1000);
      const response = await doFetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have not started the plugin", async () => {
      await server._stopPlugins();
      await waitForServer();
      const error = await doApiFetch("/config").catch((err) => Promise.resolve(err));
      expect(error.message).toEqual(expect.stringContaining("ECONNREFUSED"));
    });
  });

  describe("when plugins are started", () => {
    it("should respond with same collection", async () => {
      await server._startPlugins();
      await waitForServer();
      const response = await doFetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have started the plugin", async () => {
      const response = await doApiFetch("/config");
      expect(response.body.files.path).toEqual(fixturesFolder("web-tutorial"));
    });

    it("should respond to mock requests", async () => {
      const response = await doFetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });

  describe("when url does not exist", () => {
    it("should respond not found", async () => {
      const response = await doApiFetch("/foo");
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({ error: "Not Found", message: "Not Found", statusCode: 404 });
    });
  });

  describe("when there is an error", () => {
    let routes;
    beforeAll(() => {
      routes = server.mock.routes.plain;
      server.mock._routes = null;
    });

    afterAll(() => {
      server.mock._routes = routes;
    });

    it("should respond with error 500", async () => {
      const response = await doApiFetch("/mock/routes");
      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        error: "Internal Server Error",
        message: "An internal server error occurred",
        statusCode: 500,
      });
    });
  });

  describe("when port option changes", () => {
    it("should respond at new port", async () => {
      await doApiFetch("/config", {
        method: "PATCH",
        body: {
          plugins: {
            adminApi: {
              port: 3102,
            },
          },
        },
      });
      await waitForServer(3102);
      const response = await doApiFetch("/config", {
        port: 3102,
      });
      expect(response.body.files.path).toEqual(fixturesFolder("web-tutorial"));
    });

    it("should respond to mock requests at same port", async () => {
      const response = await doFetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });

  describe("when options change many times", () => {
    it("should respond", async () => {
      hostOption.value = "127.0.0.1";
      hostOption.value = "0.0.0.0";
      hostOption.value = "127.0.0.1";
      hostOption.value = "0.0.0.0";
      hostOption.value = "127.0.0.1";
      portOption.value = 3102;
      await waitForServer(3102);
      await doApiFetch("/config", {
        port: 3102,
        method: "PATCH",
        body: {
          plugins: {
            adminApi: {
              host: "127.0.0.1",
              port: 3103,
            },
          },
        },
      });
      await waitForServer(3103);
      const response = await doApiFetch("/config", {
        port: 3103,
      });
      expect(response.body.files.path).toEqual(fixturesFolder("web-tutorial"));
    });
  });

  describe("when host is wrong", () => {
    it("should not respond", async () => {
      hostOption.value = "foo";
      await wait(1000);
      const error = await doApiFetch("/config", { port: 3103 }).catch((err) =>
        Promise.resolve(err)
      );
      expect(error.message).toEqual(expect.stringContaining("ECONNREFUSED"));
    });
  });

  describe("when port is wrong", () => {
    it("should not respond", async () => {
      hostOption.value = "0.0.0.0";
      portOption.value = 13240230;
      await wait(3000);

      const error = await doApiFetch("/config", { port: 3103 }).catch((err) =>
        Promise.resolve(err)
      );
      expect(error.message).toEqual(expect.stringContaining("ECONNREFUSED"));
    });
  });

  describe("when port is right", () => {
    it("should respond again", async () => {
      hostOption.value = "0.0.0.0";
      portOption.value = 3115;

      await waitForServer(3115);
      const response = await doApiFetch("/config", {
        port: 3115,
      });
      expect(response.body.plugins.adminApi.port).toEqual(3115);
      expect(response.body.plugins.adminApi.host).toEqual("0.0.0.0");
    });
  });
});
