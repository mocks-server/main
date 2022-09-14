/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServer,
  fixturesFolder,
  removeConfigFile,
} = require("../support/helpers");

describe("when adding route handlers in config file", () => {
  let mocks;

  describe("When started", () => {
    beforeAll(async () => {
      mocks = mocksRunner([], {
        cwd: fixturesFolder("config-file-with-routes-handler"),
      });
      await waitForServer();
    });

    afterAll(async () => {
      removeConfigFile();
      await mocks.kill();
    });

    it("should have log level silly", async () => {
      expect(mocks.logs.current).toEqual(expect.stringContaining("[silly]"));
    });

    it("should serve users in /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("custom handler should have traced", async () => {
      expect(mocks.logs.current).toEqual(
        expect.stringContaining("Custom request GET => /api/users")
      );
      expect(mocks.logs.current).toEqual(expect.stringContaining("Custom request GET =>"));
    });
  });
});
