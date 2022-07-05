/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  doFetch,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  removeConfigFile,
} = require("./support/helpers");

describe("path setting", () => {
  let core, changePath;

  beforeAll(async () => {
    changePath = (name) => {
      core.config.namespace("files").option("path").value = name;
    };
    core = await startCore();
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("When started", () => {
    it("should load web-tutorial mocks", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When path setting is changed", () => {
    it("should have loaded new mocks", async () => {
      changePath(fixturesFolder("web-tutorial-modified"));
      await waitForServerUrl("/api/new-users");

      const users = await doFetch("/api/new-users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
        { id: 3, name: "Brand new user" },
      ]);

      const oldUsers = await doFetch("/api/users");
      expect(oldUsers.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
      ]);
    });
  });
});
