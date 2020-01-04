/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { request, wait, BINARY_PATH } = require("./utils");
const InteractiveCliRunner = require("./InteractiveCliRunner");

describe("Cli stop method", () => {
  let cli;
  const cwdPath = path.resolve(__dirname, "fixtures");

  beforeAll(async () => {
    cli = new InteractiveCliRunner([BINARY_PATH, "--path=web-tutorial"], {
      cwd: cwdPath
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should have 3 behaviors available", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });
  });

  describe("When changing logs level", () => {
    it("should display new selected log level", async () => {
      await cli.cursorDown(3);
      await cli.pressEnter();
      await cli.cursorDown(2);
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Log level: verbose"));
    });
  });

  describe("when using api plugin to disable inquirer-cli", () => {
    beforeAll(async () => {
      cli.flush();
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          cli: false
        }
      });
      await wait();
    });

    it("should not display cli", async () => {
      await request("/api/users");
      expect(cli.logs).toEqual(expect.stringContaining("Request received | GET => /api/users"));
    });

    it("should not work to select log level using cli", async () => {
      try {
        await cli.cursorDown(3);
        await cli.pressEnter();
        await cli.cursorDown(2);
        await cli.pressEnter();
      } catch (err) {
        expect(err.message).toEqual(expect.stringContaining("No new screen"));
      }
    });
  });

  describe("when using api plugin to disable inquirer-cli", () => {
    beforeAll(async () => {
      cli.flush();
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          cli: true
        }
      });
      await wait();
    });

    it("should not display cli", async () => {
      await request("/api/users");
      expect(cli.logs).not.toEqual(
        expect.stringContaining("Request received | GET => /api/users")
      );
    });

    it("should display new selected log level", async () => {
      await cli.cursorDown(3);
      await cli.pressEnter();
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Log level: silly"));
    });
  });
});
