/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, waitForServerAndCli } = require("./support/helpers");

describe("with no behaviors", () => {
  let mocks;

  afterEach(async () => {
    await mocks.kill();
  });

  it("should display alerts", async () => {
    mocks = mocksRunner(["--files.path=no-mocks", "--mocks.selected=foo"]);
    await waitForServerAndCli();
    expect(mocks.currentScreen).toEqual(expect.stringContaining("ALERTS"));
    expect(mocks.currentScreen).toEqual(
      expect.stringContaining("Warning: [mocks:empty] No mocks found")
    );
  });

  it("should print a dash as current behavior", async () => {
    mocks = mocksRunner(["--files.path=no-mocks"]);
    await waitForServerAndCli();
    expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: -"));
  });

  it("should print mocks as 0", async () => {
    mocks = mocksRunner(["--files.path=no-mocks"]);
    await waitForServerAndCli();
    expect(mocks.currentScreen).toEqual(expect.stringContaining("Mocks: 0"));
  });

  it("should print current routes as 0", async () => {
    mocks = mocksRunner(["--files.path=no-mocks"]);
    await waitForServerAndCli();
    expect(mocks.logs).toEqual(expect.stringContaining("Routes: 0"));
  });
});
