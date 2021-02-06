/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const {
  startCore,
  fetch,
  fixturesFolder,
  waitForServer,
  findAlert,
} = require("./support/helpers");

describe("when path not exists", () => {
  const FOLDER = "unexistant";
  let core;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder(FOLDER));
    core = await startCore(FOLDER);
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  it("should start server and return 404 to all requests", async () => {
    const users = await fetch("/api/users", {
      resolveWithFullResponse: true,
      simple: false,
    });
    expect(users.status).toEqual(404);
  });

  it("should have no mocks", async () => {
    expect(core.mocks.plainMocks.length).toEqual(0);
  });

  it("should have created folder", async () => {
    expect(fsExtra.existsSync(fixturesFolder(FOLDER))).toEqual(true);
  });

  it("should have added an alert about not mock found", async () => {
    expect(findAlert("mocks:current:amount", core.alerts).message).toEqual("No mocks found");
  });

  it("should have added an alert about path not found", async () => {
    expect(findAlert("load:folder", core.alerts).message).toEqual(
      expect.stringContaining("Created folder")
    );
  });
});
