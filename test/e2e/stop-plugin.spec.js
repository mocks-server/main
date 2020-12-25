/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request, fixturesFolder, wait } = require("./support/utils");

describe("stop plugin", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial");
  });

  afterAll(async () => {
    await stopServer(server);
  });

  describe("when started", () => {
    it("should return current settings", async () => {
      const response = await request("/admin/settings");
      expect(response).toEqual({
        behavior: "standard",
        path: fixturesFolder("web-tutorial"),
        delay: 0,
        host: "0.0.0.0",
        port: 3100,
        watch: false,
        log: "silly",
        adminApiPath: "/admin",
        adminApiDeprecatedPaths: true,
      });
    });
  });

  describe("when stopped", () => {
    it("should respond not found when requesting setting", async () => {
      await server._stopPlugins();
      const response = await request("/admin/settings", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(response.statusCode).toEqual(404);
    });

    it("should respond to mocks requests", async () => {
      await server._stopPlugins();
      const response = await request("/api/users");
      expect(response).toEqual([
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

  describe("when behavior is changed", () => {
    it("should respond with new behavior", async () => {
      server.settings.set("behavior", "user2");
      await wait(1000);
      const response = await request("/api/users/2");
      expect(response).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have not started the plugin", async () => {
      await server._stopPlugins();
      const response = await request("/admin/settings", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("when plugins are started", () => {
    it("should respond with same behavior", async () => {
      await server._startPlugins();
      const response = await request("/api/users/2");
      expect(response).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have started the plugin", async () => {
      const response = await request("/admin/settings");
      expect(response).toEqual({
        behavior: "user2",
        path: fixturesFolder("web-tutorial"),
        delay: 0,
        host: "0.0.0.0",
        port: 3100,
        watch: false,
        log: "silly",
        adminApiPath: "/admin",
        adminApiDeprecatedPaths: true,
      });
    });
  });
});
