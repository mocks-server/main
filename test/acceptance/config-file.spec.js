/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { request, wait, BINARY_PATH } = require("./utils");
const InteractiveCliRunner = require("./InteractiveCliRunner");

describe("web tutorial", () => {
  let cli;
  const cwdPath = path.resolve(__dirname, "fixtures", "config-file");

  beforeAll(async () => {
    cli = new InteractiveCliRunner([path.join("..", BINARY_PATH)], {
      cwd: cwdPath
    });
    await wait(2000);
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should have log level silly", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("[Mocks silly]"));
    });

    it("should load TraceMocksPlugin", async () => {
      expect(cli.logs).toEqual(expect.stringContaining('Initializing plugin "trace-mocks"'));
    });

    it("should display user2 behavior", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("Current behavior: user2"));
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
