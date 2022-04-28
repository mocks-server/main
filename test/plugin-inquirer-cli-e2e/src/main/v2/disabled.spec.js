/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServer, TimeCounter } = require("./support/helpers");

describe("command line arguments with cli disabled", () => {
  let mocks;

  afterEach(async () => {
    await mocks.kill();
  });

  describe("interactive cli", () => {
    it("should not be started", async () => {
      mocks = mocksRunner(["--path=web-tutorial", "--no-cli"]);
      await waitForServer();
      expect(mocks.logs).toEqual(expect.not.stringContaining("Select action"));
    });
  });

  describe("path option", () => {
    it("should set mocks folder", async () => {
      mocks = mocksRunner(["--path=web-tutorial", "--no-cli"]);
      await waitForServer();
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("behavior option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        mocks = mocksRunner(["--path=web-tutorial", "--no-cli"]);
        await waitForServer();
        const users = await fetch("/api/users/2");
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        mocks = mocksRunner(["--path=web-tutorial", "--no-cli", "--mock=user-2"]);
        await waitForServer();
        const users = await fetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
      });
    });
  });

  describe("delay option", () => {
    it("should set delay", async () => {
      expect.assertions(2);
      mocks = mocksRunner(["--path=web-tutorial", "--no-cli", "--delay=2000"]);
      await waitForServer();
      const timeCounter = new TimeCounter();
      const users = await fetch("/api/users");
      timeCounter.stop();
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });
});
