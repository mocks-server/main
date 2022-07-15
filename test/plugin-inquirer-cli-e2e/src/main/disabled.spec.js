/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, doFetch, waitForServer, TimeCounter } = require("./support/helpers");

describe("command line arguments with cli disabled", () => {
  jest.setTimeout(15000);
  let mocks;

  afterEach(async () => {
    await mocks.kill();
  });

  describe("interactive cli", () => {
    it("should not be started", async () => {
      mocks = mocksRunner(["--files.path=web-tutorial", "--no-plugins.inquirerCli.enabled"]);
      await waitForServer();
      expect(mocks.logs).toEqual(expect.not.stringContaining("Select action"));
    });
  });

  describe("path option", () => {
    it("should set mocks folder", async () => {
      mocks = mocksRunner(["--files.path=web-tutorial", "--no-plugins.inquirerCli.enabled"]);
      await waitForServer();
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("collection option", () => {
    describe("when not provided", () => {
      it("should set as current collection the first one found", async () => {
        mocks = mocksRunner(["--files.path=web-tutorial", "--no-plugins.inquirerCli.enabled"]);
        await waitForServer();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when legacy is provided and exists", () => {
      it("should set current collection", async () => {
        mocks = mocksRunner([
          "--files.path=web-tutorial",
          "--no-plugins.inquirerCli.enabled",
          "--mocks.selected=user-2",
        ]);
        await waitForServer();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
      });
    });

    describe("when is provided and exists", () => {
      it("should set current collection", async () => {
        mocks = mocksRunner([
          "--files.path=web-tutorial",
          "--no-plugins.inquirerCli.enabled",
          "--mock.collections.selected=user-2",
        ]);
        await waitForServer();
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
      });
    });
  });

  describe("legacy delay option", () => {
    it("should set delay", async () => {
      expect.assertions(2);
      mocks = mocksRunner([
        "--files.path=web-tutorial",
        "--no-plugins.inquirerCli.enabled",
        "--mocks.delay=2000",
      ]);
      await waitForServer();
      const timeCounter = new TimeCounter();
      const users = await doFetch("/api/users");
      timeCounter.stop();
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("legacy option", () => {
    it("should set delay", async () => {
      expect.assertions(2);
      mocks = mocksRunner([
        "--files.path=web-tutorial",
        "--no-plugins.inquirerCli.enabled",
        "--mock.routes.delay=2000",
      ]);
      await waitForServer();
      const timeCounter = new TimeCounter();
      const users = await doFetch("/api/users");
      timeCounter.stop();
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });
});
