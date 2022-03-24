/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { request, wait, TimeCounter, BINARY_PATH } = require("./support/utils");
const InteractiveCliRunner = require("../../inquirer/support/InteractiveCliRunner");

describe("interactive CLI", () => {
  jest.setTimeout(15000);
  let cli;
  const cwdPath = path.resolve(__dirname, "fixtures");

  beforeAll(async () => {
    cli = new InteractiveCliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--behavior=foo"], {
      cwd: cwdPath,
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should display an alert because chosen behavior does not exist", async () => {
      expect(cli.currentScreen).toEqual(
        expect.stringContaining('Defined behavior "foo" was not found.')
      );
      expect(cli.currentScreen).toEqual(expect.stringContaining("ALERTS"));
    });

    it("should have loaded first behavior", async () => {
      expect(cli.currentScreen).toEqual(expect.stringContaining("Current behavior: standard"));
    });

    it("should have 3 behaviors available", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("behaviors: 3"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('When changing current behavior to "dynamic"', () => {
    it("should display new selected behavior", async () => {
      await cli.cursorDown(8);
      await cli.pressEnter();
      await cli.cursorDown(2);
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current behavior: dynamic"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await request("/api/users/3", {
        resolveWithFullResponse: true,
      });
      expect(usersResponse.statusCode).toEqual(404);
    });
  });

  describe("When changing logs level", () => {
    it("should display new selected log level", async () => {
      await cli.cursorDown(5);
      await cli.pressEnter();
      await cli.cursorDown(2);
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Log level: verbose"));
    });
  });

  describe("When displaying logs", () => {
    it("should log requests", async () => {
      expect.assertions(2);
      await cli.cursorDown(7);
      await cli.pressEnter();
      await request("/api/users");
      await wait(1000);
      expect(cli.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
      expect(cli.currentScreen).toEqual(
        expect.stringContaining("[Mocks verbose] Request received")
      );
      await cli.pressEnter();
    });
  });

  describe("When changing delay time", () => {
    it("should display new selected delay time", async () => {
      await cli.cursorDown(3);
      await cli.pressEnter();
      await cli.write(2000);
      const newScreen = await cli.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Delay: 2000"));
    });

    it("should respond after defined delay", async () => {
      expect.assertions(2);
      const timeCounter = new TimeCounter();
      const users = await request("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(1999);
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
