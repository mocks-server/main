/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, doFetch, waitForServerAndCli, TimeCounter } = require("./support/helpers");

describe("command line arguments", () => {
  let mocks;

  afterEach(async () => {
    await mocks.kill();
  });

  describe("path option", () => {
    it("should set mocks folder", async () => {
      expect.assertions(2);
      mocks = mocksRunner(["--files.path=web-tutorial"]);
      await waitForServerAndCli();
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Mocks: 3"));
    });
  });

  describe("mock option", () => {
    describe("when not provided", () => {
      it("should set as current mock the first one found", async () => {
        expect.assertions(2);
        mocks = mocksRunner(["--files.path=web-tutorial"]);
        await waitForServerAndCli();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: base"));
      });
    });

    describe("when provided and exists", () => {
      it("should set current mock", async () => {
        expect.assertions(2);
        mocks = mocksRunner(["--files.path=web-tutorial", "--mocks.selected=user-2"]);
        await waitForServerAndCli();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: user-2"));
      });
    });

    describe("when provided and does not exist", () => {
      it("should display an alert", async () => {
        mocks = mocksRunner(["--files.path=web-tutorial", "--mocks.selected=foo"]);
        await waitForServerAndCli();
        expect(mocks.currentScreen).toEqual(expect.stringContaining("ALERTS"));
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Mock 'foo' was not found"));
      });

      it("should set as current behavior the first one found", async () => {
        expect.assertions(3);
        mocks = mocksRunner(["--files.path=web-tutorial", "--mocks.selected=foo"]);
        await waitForServerAndCli();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Using the first one found"));
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Current mock: base"));
      });
    });
  });

  describe("delay option", () => {
    it("should set delay", async () => {
      expect.assertions(3);
      mocks = mocksRunner(["--files.path=web-tutorial", "--mocks.delay=2000"]);
      await waitForServerAndCli();
      const timeCounter = new TimeCounter();
      const users = await doFetch("/api/users");
      timeCounter.stop();
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Delay: 2000"));
      expect(timeCounter.total).toBeGreaterThan(1999);
    }, 10000);
  });

  describe("log option", () => {
    it("should set log level", async () => {
      mocks = mocksRunner(["--files.path=web-tutorial", "--log=debug"]);
      await waitForServerAndCli();
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Log level: debug"));
    });
  });

  describe("emojis option", () => {
    it("should print emojis by default", async () => {
      mocks = mocksRunner(["--files.path=web-tutorial"]);
      await waitForServerAndCli();
      expect(mocks.currentScreen).toEqual(expect.stringContaining("↕️"));
    });

    it("should disable emojis when --no-plugins.inquirerCli.emojis argument is received", async () => {
      mocks = mocksRunner(["--files.path=web-tutorial", "--no-plugins.inquirerCli.emojis"]);
      await waitForServerAndCli();
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("↕️"));
    });
  });
});
