/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  createCore,
  doFetch,
  fixturesFolder,
  findTrace,
  removeConfigFile,
} = require("../support/helpers");

const RouteHandler = require("../fixtures/config-file-with-routes-handler/CustomRoutesHandler");

describe("when registering route handlers", () => {
  describe("When started", () => {
    let core;

    beforeAll(async () => {
      core = createCore({
        mock: { collections: { selected: "custom-users" } },
        files: {
          watch: false,
          path: fixturesFolder("custom-routes-handler"),
        },
      });
      core.variantHandlers.register([RouteHandler]);
      await core.start();
      core.logger.setLevel("debug", { transport: "store" });
    });

    afterAll(async () => {
      removeConfigFile();
      await core.stop();
    });

    it("should serve users in /api/users path", async () => {
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("custom handler should have traced", async () => {
      expect(findTrace("Custom request GET => /api/users", core.logger.globalStore)).toBeDefined();
    });
  });
});
