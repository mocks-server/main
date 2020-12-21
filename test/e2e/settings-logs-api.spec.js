/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");
const fsExtra = require("fs-extra");

const { CliRunner, request, fixturesFolder, wait } = require("./utils");

describe("log option modified through api", () => {
  let cli;
  beforeAll(async () => {
    cli = new CliRunner(["node", "start.js", "--path=web-tutorial", "--log=info"], {
      cwd: path.resolve(__dirname, "fixtures"),
    });
    await wait(1000);
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("when started", () => {
    it("should return log level when getting settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse.log).toEqual("info");
    });

    it("should not have logged any log with verbose level", async () => {
      expect(cli.logs).toEqual(expect.not.stringContaining("Mocks verbose"));
    });
  });

  describe("when log level is changed to verbose", () => {
    beforeAll(async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          log: "verbose",
        },
      });
      fsExtra.copySync(fixturesFolder("files-modification"), fixturesFolder("files-watch"));
      await wait(1000);
    });

    it("should return new log level when getting settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse.log).toEqual("verbose");
    });

    it("should have logged logs with verbose level", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("Mocks verbose"));
    });
  });
});
