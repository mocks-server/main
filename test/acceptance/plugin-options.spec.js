/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");
const { startServer, stopServer, request, CliRunner, wait, fixturesFolder } = require("./utils");

describe("plugin options", () => {
  let server;
  let cli;

  describe("adminApiDeprecatedPaths option", () => {
    beforeAll(async () => {
      server = await startServer("web-tutorial", {
        adminApiDeprecatedPaths: false,
      });
    });

    afterAll(() => {
      stopServer(server);
    });

    it("should disable deprecated behaviors api path", async () => {
      const behaviorsResponse = await request("/mocks/behaviors", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated features api path", async () => {
      const behaviorsResponse = await request("/mocks/features", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated settings api path", async () => {
      const behaviorsResponse = await request("/mocks/settings", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });
  });

  describe("adminApiDeprecatedPaths option used from CLI", () => {
    beforeAll(async () => {
      cli = new CliRunner(
        ["node", "start.js", "--path=web-tutorial", "--no-adminApiDeprecatedPaths"],
        {
          cwd: path.resolve(__dirname, "fixtures"),
        }
      );
      await wait(1000);
    });

    afterAll(async () => {
      await cli.kill();
    });

    it("should disable deprecated behaviors api path", async () => {
      console.log(cli.logs);
      const behaviorsResponse = await request("/mocks/behaviors", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated features api path", async () => {
      const behaviorsResponse = await request("/mocks/features", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated settings api path", async () => {
      const behaviorsResponse = await request("/mocks/settings", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });
  });

  describe("adminApiPath option", () => {
    beforeAll(async () => {
      server = await startServer("web-tutorial", {
        adminApiPath: "/foo",
      });
    });

    afterAll(() => {
      stopServer(server);
    });

    it("should change the administration api path", async () => {
      const adminResponse = await request("/foo/settings");
      expect(adminResponse).toEqual({
        behavior: "standard",
        path: fixturesFolder("web-tutorial"),
        delay: 0,
        host: "0.0.0.0",
        port: 3100,
        watch: false,
        log: "silly",
        adminApiPath: "/foo",
        adminApiDeprecatedPaths: true,
      });
    });
  });
});
