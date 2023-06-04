/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const {
  mocksRunner,
  doFetch,
  waitForServer,
  fixturesFolder,
  wait,
  removeConfigFile,
} = require("../support/helpers");

describe("when using config file", () => {
  let mocks;

  describe("When started", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.copy(fixturesFolder("web-tutorial"), fixturesFolder("temp"));
      mocks = mocksRunner([], {
        cwd: fixturesFolder("config-file"),
      });
      await waitForServer();
    });

    afterAll(async () => {
      removeConfigFile();
      await fsExtra.remove(fixturesFolder("temp"));
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

    it("should serve user 2 in /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");

      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 in /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");

      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should have watch disabled", async () => {
      await fsExtra.copy(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await wait(4000);
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
