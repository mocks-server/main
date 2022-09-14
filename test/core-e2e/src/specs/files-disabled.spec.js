/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { mocksRunner, waitForServer, fixturesFolder } = require("../support/helpers");

const configFile = path.resolve(fixturesFolder("temp"), "mocks.config.js");
const customStarter = path.resolve(fixturesFolder("temp"), "starter");

describe("when files and config file are disabled", () => {
  let mocks;

  describe("When inited", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.ensureDir(fixturesFolder("temp"));
      await fsExtra.copy(fixturesFolder("starter"), customStarter);
      mocks = mocksRunner([], {
        customBinary: customStarter,
        cwd: fixturesFolder("temp"),
        env: {
          MOCKS_FILES_ENABLED: "0",
          MOCKS_CONFIG_READ_FILE: "false",
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await mocks.kill();
      await fsExtra.remove(fixturesFolder("temp"));
    });

    describe("when started", () => {
      it("should have not created the mocks scaffold", async () => {
        expect(
          fsExtra.existsSync(path.resolve(fixturesFolder("temp"), "mocks", "collections.json"))
        ).toEqual(false);
      });

      it("should have not created the config file", async () => {
        expect(fsExtra.existsSync(configFile)).toEqual(false);
      });
    });
  });
});
