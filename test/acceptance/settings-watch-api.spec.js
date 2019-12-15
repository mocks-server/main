/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");
const fsExtra = require("fs-extra");

const { CliRunner, request, fixturesFolder, wait } = require("./utils");

describe("watch option modified through api", () => {
  let cli;
  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    cli = new CliRunner(["node", "start.js", "--path=files-watch", "--watch=false"], {
      cwd: path.resolve(__dirname, "fixtures")
    });
    await wait(1000);
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("when started", () => {
    it("should return watch disabled when getting settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse.watch).toEqual(false);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });
  });

  describe("when watch is enabled and files are modified", () => {
    beforeAll(async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          watch: true
        }
      });
      fsExtra.copySync(fixturesFolder("files-modification"), fixturesFolder("files-watch"));
      await wait(2000);
    });

    it("should return watch enabled when getting settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse.watch).toEqual(true);
    });

    it("should serve new users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" }
      ]);
    });
  });

  describe("when watch is disabled and files are modified", () => {
    beforeAll(async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          watch: false
        }
      });
      fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
      await wait(2000);
    });

    it("should return watch disabled when getting settings", async () => {
      const settingsResponse = await request("/admin/settings");
      expect(settingsResponse.watch).toEqual(false);
    });

    it("should serve new users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" }
      ]);
    });
  });
});
