/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { request, wait, BINARY_PATH } = require("./support/utils");
const InteractiveCliRunner = require("./support/InteractiveCliRunner");

describe("Cli stop method", () => {
  let cli;
  const cwdPath = path.resolve(__dirname, "fixtures");

  beforeAll(async () => {
    cli = new InteractiveCliRunner([BINARY_PATH, "--path=web-tutorial"], {
      cwd: cwdPath,
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
        { id: 2, name: "Jane Doe" },
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
          cli: false,
        },
      });
      await wait(3000);
    });

    it("should not display cli", async () => {
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
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

    it("should display logs", async () => {
      await request("/api/users");
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
      expect(cli.currentScreen).toEqual(
        expect.stringContaining("[Mocks verbose] Request received")
      );
    });

    it("should not start when files are changed", async () => {
      expect.assertions(2);
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          path: "no-behaviors",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
      const usersResponse = await request("/api/users", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(usersResponse.statusCode).toEqual(404);
    });

    it("should not start when there is an error in files", async () => {
      expect.assertions(2);
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          path: "files-error",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(
        expect.stringContaining("Error loading files from folder")
      );
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
    });

    it("should not start when behaviors load successfully", async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          path: "web-tutorial",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
    });

    it("should not start when settings different to cli are changed", async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          behavior: "user2",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("CURRENT SETTINGS"));
    });
  });

  describe("when using api plugin to enable inquirer-cli", () => {
    beforeAll(async () => {
      cli.flush();
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          cli: true,
        },
      });
      await wait(3000);
    });

    it("should display cli", async () => {
      expect(cli.currentScreen).toEqual(expect.stringContaining("CURRENT SETTINGS"));
    });

    it("should display new settings if they were changed while it was stopped", async () => {
      expect(cli.currentScreen).toEqual(expect.stringContaining("Current behavior: user2"));
    });

    it("should display new selected log level", async () => {
      await cli.cursorDown(3);
      await cli.pressEnter();
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Log level: silly"));
    });

    it("should display alerts when there is an error in files", async () => {
      expect.assertions(2);
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          path: "files-error",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(expect.stringContaining("ALERTS"));
      expect(cli.currentScreen).toEqual(
        expect.stringContaining("Error loading files from folder")
      );
    });

    it("should not display alerts when error in files is fixed", async () => {
      await request("/admin/settings", {
        method: "PATCH",
        body: {
          path: "web-tutorial",
        },
      });
      await wait(2000);
      expect(cli.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
    });
  });
});
