/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServerAndCli,
  wait,
  TimeCounter,
} = require("./support/helpers");

describe("interactive CLI", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    mocks = mocksRunner(["--files.path=web-tutorial", "--mock.collections.selected=foo"]);
    await waitForServerAndCli();
  });

  afterAll(async () => {
    await mocks.kill();
  });

  describe("When started", () => {
    it("should display an alert because chosen mock does not exist", async () => {
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("Collection 'foo' was not found.")
      );
      expect(mocks.currentScreen).toEqual(expect.stringContaining("ALERTS"));
    });

    it("should have loaded first mock", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Current collection: base"));
    });

    it("should have 3 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 3"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('When changing current mock to "user-real"', () => {
    it("should display new selected mock", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current collection: user-real"));
    });

    it("should have removed alert", async () => {
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await doFetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("When changing logs level", () => {
    it("should display new selected log level", async () => {
      await mocks.cursorDown(5);
      await mocks.pressEnter();
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Log level: verbose"));
    });
  });

  describe("When displaying logs", () => {
    it("should log requests", async () => {
      expect.assertions(2);
      await mocks.cursorDown(7);
      await mocks.pressEnter();
      await wait(500);
      await doFetch("/api/users");
      await wait(1000);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("[verbose][mock:routes:get-users:success] Sending response")
      );
      await mocks.pressEnter();
    });
  });

  describe("When changing delay time", () => {
    it("should display new selected delay time", async () => {
      await mocks.cursorDown(3);
      await mocks.pressEnter();
      await mocks.write(2000);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Delay: 2000"));
    });

    it("should respond after defined delay", async () => {
      expect.assertions(2);
      const timeCounter = new TimeCounter();
      const users = await doFetch("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(1999);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
