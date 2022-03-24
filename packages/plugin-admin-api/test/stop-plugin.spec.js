/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, fetch, fixturesFolder, wait, waitForServer } = require("./support/helpers");

describe("when stopping plugin", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("when started", () => {
    it("should return current settings", async () => {
      const response = await fetch("/admin/settings");
      expect(response.body.path).toEqual(fixturesFolder("web-tutorial"));
    });
  });

  describe("when stopped", () => {
    it("should respond not found when requesting setting", async () => {
      await server._stopPlugins();
      await waitForServer();
      const response = await fetch("/admin/settings");
      expect(response.status).toEqual(404);
    });

    it("should respond to mocks requests", async () => {
      await server._stopPlugins();
      const response = await fetch("/api/users");
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

  describe("when mock is changed", () => {
    it("should respond with new mock", async () => {
      server.settings.set("mock", "user-2");
      await wait(1000);
      const response = await fetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have not started the plugin", async () => {
      await server._stopPlugins();
      await waitForServer();
      const response = await fetch("/admin/settings");
      expect(response.status).toEqual(404);
    });
  });

  describe("when plugins are started", () => {
    it("should respond with same mock", async () => {
      await server._startPlugins();
      await waitForServer();
      const response = await fetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });

    it("should have started the plugin", async () => {
      const response = await fetch("/admin/settings");
      expect(response.body.path).toEqual(fixturesFolder("web-tutorial"));
    });
  });
});
