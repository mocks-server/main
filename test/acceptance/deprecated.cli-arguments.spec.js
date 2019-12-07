/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, request, wait, BINARY_PATH } = require("./utils");

describe("command line arguments", () => {
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  describe("behaviors option", () => {
    it("should set mocks folder", async () => {
      expect.assertions(2);
      cli = new CliRunner([BINARY_PATH, "--behaviors=web-tutorial"], {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });
  });

  describe("features option", () => {
    it("should set mocks folder", async () => {
      expect.assertions(2);
      cli = new CliRunner([BINARY_PATH, "--features=web-tutorial"], {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });
  });

  describe("feature option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner([BINARY_PATH, "--features=web-tutorial"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        expect.assertions(2);
        cli = new CliRunner([BINARY_PATH, "--features=web-tutorial", "--feature=dynamic"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner([BINARY_PATH, "--features=web-tutorial", "--feature=foo"], {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner([BINARY_PATH, "--features=web-tutorial", "--feature=foo"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });
  });
});
