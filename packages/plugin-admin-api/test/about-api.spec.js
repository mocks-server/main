/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doApiFetch, waitForServer } = require("./support/helpers");
const { version } = require("../package.json");
const { version: coreVersion } = require("../../core/package.json");

describe("about api", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /", () => {
    it("should return current version", async () => {
      const response = await doApiFetch("/about");

      expect(response.body).toEqual({
        versions: {
          adminApi: version,
          core: coreVersion,
        },
      });
    });
  });
});
