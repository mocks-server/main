/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");
const fsExtra = require("fs-extra");

const { CliRunner, request, fixturesFolder, wait } = require("./support/utils");

describe("alerts api", () => {
  let cli;
  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    cli = new CliRunner(["node", "start.js", "--path=files-watch", "--behavior=foo"], {
      cwd: path.resolve(__dirname, "fixtures"),
    });
    await wait(2000);
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("when started", () => {
    it("should return behavior not found alert", async () => {
      const response = await request("/admin/alerts");
      expect(response.length).toEqual(1);
    });

    it("should return specific alert when requested by id", async () => {
      const response = await request("/admin/alerts/mocks%3Abehaviors%3Acurrent");
      expect(response).toEqual({
        id: "mocks:behaviors:current",
        context: "mocks:behaviors:current",
        message: 'Defined behavior "foo" was not found. The first one found was used instead',
        error: null,
      });
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when behavior is modified", () => {
    beforeAll(async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          behavior: "dynamic",
        },
      });
      await wait();
    }, 10000);

    it("should return no alerts", async () => {
      const response = await request("/admin/alerts");
      expect(response.length).toEqual(0);
    });
  });

  describe("when files contain an error", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("files-error"), fixturesFolder("files-watch"));
      await wait(6000);
    }, 10000);

    it("should return one alert", async () => {
      const response = await request("/admin/alerts");
      expect(response.length).toEqual(1);
    });

    it("should return specific alert when requested by id", async () => {
      const response = await request(
        "/admin/alerts/plugins%3A%40mocks-server%2Fcore%2Fplugin-files-loader%3Aload"
      );
      expect(response.id).toEqual("plugins:@mocks-server/core/plugin-files-loader:load");
      expect(response.message).toEqual(expect.stringContaining("test/e2e/fixtures/files-watch"));
      expect(response.error.name).toEqual("ReferenceError");
      expect(response.error.message).toEqual("FOO is not defined");
      expect(response.error.stack).toEqual(
        expect.stringContaining("test/e2e/fixtures/files-watch/fixtures/users.js:2:18")
      );
    });
  });

  describe("when files error is fixed", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
      await wait(6000);
    }, 10000);

    it("should return no alerts", async () => {
      const response = await request("/admin/alerts");
      expect(response.length).toEqual(0);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
