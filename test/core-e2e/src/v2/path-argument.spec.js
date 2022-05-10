/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { mocksRunner, fetch, fixturesFolder, waitForServer } = require("./support/helpers");

describe("path argument", () => {
  const FOLDER = "mocks";
  let mocks;

  describe("when no defined", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder(FOLDER));
      mocks = mocksRunner();
      await waitForServer();
    });

    afterAll(async () => {
      await fsExtra.remove(fixturesFolder(FOLDER));
      await mocks.kill();
    });

    it("should print a warning about creating folder", async () => {
      expect(mocks.logs.joined).toEqual(expect.stringContaining("Created folder"));
    });

    it("should have created a mocks folder", async () => {
      expect(fsExtra.existsSync(fixturesFolder(FOLDER))).toEqual(true);
    });

    it("should have created scaffold folder", async () => {
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "routes"))).toEqual(true);
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "mocks.json"))).toEqual(true);
    });
  });

  describe("when defined", () => {
    beforeAll(async () => {
      mocks = mocksRunner(["--plugins.filesLoader.path=web-tutorial"]);
      await waitForServer();
    });

    afterAll(async () => {
      await mocks.kill();
    });

    it("should serve users under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
