/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request } = require("./utils");

describe("plugin options", () => {
  let server;

  describe("adminApiDeprecatedPaths option", () => {
    beforeAll(async () => {
      server = await startServer("web-tutorial", {
        adminApiDeprecatedPaths: false
      });
    });

    afterAll(() => {
      stopServer(server);
    });

    it("should disable deprecated behaviors api path", async () => {
      const behaviorsResponse = await request("/mocks/behaviors", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated fixtures api path", async () => {
      const behaviorsResponse = await request("/mocks/fixtures", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });

    it("should disable deprecated settings api path", async () => {
      const behaviorsResponse = await request("/mocks/settings", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(behaviorsResponse.statusCode).toEqual(404);
    });
  });
});
