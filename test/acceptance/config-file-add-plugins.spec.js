/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, request, wait } = require("./utils");

describe("when using config file", () => {
  const binaryPath = "./starter-add-plugins";
  const cwdPath = path.resolve(__dirname, "fixtures", "config-files");
  let cli;

  describe("When started", () => {
    beforeAll(async () => {
      cli = new CliRunner([binaryPath], {
        cwd: cwdPath
      });
      await wait();
    });

    afterAll(async () => {
      await cli.kill();
    });

    it("should have log level silly", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("[Mocks silly]"));
    });

    it("should load TraceMocksPlugin", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("traceMocks plugin started"));
      expect(cli.logs).toEqual(expect.stringContaining("There are 3 behaviors available"));
    });

    it("should load TraceMocksPlugin2", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("traceMocks2 plugin started"));
      expect(cli.logs).toEqual(expect.stringContaining("Hey!, 3 behaviors available"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
