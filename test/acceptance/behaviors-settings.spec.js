/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, stopCore, request, wait, fixturesFolder } = require("./utils");

describe("behaviors setting", () => {
  let core;

  beforeAll(async () => {
    core = await startCore();
  });

  afterAll(async () => {
    await stopCore(core);
  });

  describe("When started", () => {
    it("should load web-tutorial mocks", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });
  });

  describe("When behaviors setting is changed to files-modification and current behavior is changed", () => {
    it("should have loaded files-modification mocks and applied current behavior", async () => {
      core.onLoadMocks(() => {
        core.settings.set("behavior", "newOne");
      });
      core.settings.set("behaviors", fixturesFolder("files-modification"));
      await wait(3000);
      const users = await request("/api/new-users");
      expect(users).toEqual([
        { id: 1, name: "John Doe new" },
        { id: 2, name: "Jane Doe new" }
      ]);
    });
  });
});
