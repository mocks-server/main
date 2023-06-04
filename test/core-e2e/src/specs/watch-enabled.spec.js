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
  fixturesFolder,
  waitForServer,
  waitForServerUrl,
  wait,
  removeConfigFile,
} = require("../support/helpers");

describe("when files watch is enabled", () => {
  let mocks;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder("temp"));
    await fsExtra.copy(fixturesFolder("web-tutorial"), fixturesFolder("temp"));
    mocks = mocksRunner(["--files.path=temp"]);
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await fsExtra.remove(fixturesFolder("temp"));
    await mocks.kill();
  });

  describe("When started", () => {
    it("should serve users", async () => {
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When files are modified", () => {
    it("should serve users modified in /api/users path", async () => {
      await wait(2000);
      await fsExtra.copy(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await waitForServerUrl("/api/new-users");
      const users = await doFetch("/api/users");

      expect(users.headers.get("x-custom-header")).toEqual("foo-header");
      expect(users.headers.get("x-another-header")).toEqual("another-header");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
      ]);
    });

    it("should serve new users in /api/new-users path", async () => {
      const users = await doFetch("/api/new-users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
        { id: 3, name: "Brand new user" },
      ]);
    });
  });

  describe("When non routes nor mocks files are modified", () => {
    it("should serve new data in /api/users path", async () => {
      await wait(2000);
      await fsExtra.copy(fixturesFolder("web-tutorial/db"), fixturesFolder("temp/db"));
      await wait(5000);
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
