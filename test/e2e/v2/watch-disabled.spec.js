/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const { mocksRunner, fetch, fixturesFolder, waitForServer, wait } = require("./support/helpers");

describe("when files watch is disabled", () => {
  let mocks;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder("files-watch"));
    await fsExtra.copy(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    mocks = mocksRunner(["--path=files-watch", "--no-watch"]);
    await waitForServer();
  });

  afterAll(async () => {
    await fsExtra.remove(fixturesFolder("files-watch"));
    await mocks.kill();
  });

  describe("When started", () => {
    it("should serve users", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When files are modified", () => {
    beforeAll(async () => {
      await fsExtra.copy(fixturesFolder("web-tutorial-modified"), fixturesFolder("files-watch"));
      await wait(4000);
    });

    it("should serve users in /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
