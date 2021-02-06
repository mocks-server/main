/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  fetch,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
} = require("./support/helpers");

describe("path setting", () => {
  let core;

  beforeAll(async () => {
    core = await startCore();
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("When started", () => {
    it("should load web-tutorial mocks", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When path setting is changed", () => {
    it("should have loaded new mocks", async () => {
      /* core.onChangeMocks(() => {
        core.settings.set("mock", "new-users");
      }); */

      core.settings.set("path", fixturesFolder("web-tutorial-modified"));
      await waitForServerUrl("/api/new-users");

      const users = await fetch("/api/new-users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
        { id: 3, name: "Brand new user" },
      ]);

      const oldUsers = await fetch("/api/users");
      expect(oldUsers.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
      ]);
    });
  });
});
