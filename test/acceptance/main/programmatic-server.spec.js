/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, request, wait, TimeCounter } = require("./utils");

describe.skip("programmatic Server", () => {
  const cwdPath = path.resolve(__dirname, "fixtures", "programmatic-server");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should set mocks folder", async () => {
      cli = new CliRunner("start.js", {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("should print a log when started", async () => {
      cli = new CliRunner("start.js", {
        cwd: cwdPath
      });
      await wait();
      expect(cli.logs).toEqual(expect.stringContaining("Server started"));
    });
  });

  describe("behavior option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner("start.js", {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        cli = new CliRunner("start-dynamic-behavior.js", {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner("start-unexistant-behavior.js", {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner("start-unexistant-behavior.js", {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });
  });

  describe("feature option", () => {
    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        cli = new CliRunner("start-dynamic-feature.js", {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
      });

      it("should print a deprecation warning", async () => {
        cli = new CliRunner("start-dynamic-feature.js", {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(
          expect.stringContaining('Deprecation warning: "feature" option will be deprecated')
        );
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner("start-unexistant-feature.js", {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner("start-unexistant-feature.js", {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });
  });

  describe("delay option", () => {
    it("should set delay", async () => {
      expect.assertions(2);
      cli = new CliRunner("start-delay.js", {
        cwd: cwdPath
      });
      await wait();
      const timeCounter = new TimeCounter();
      const users = await request("/api/users");
      timeCounter.stop();
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("stop method", () => {
    it("should stop the server", async () => {
      expect.assertions(2);
      cli = new CliRunner("start-and-stop.js", {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
      await wait(2000);
      try {
        await request("/api/users");
      } catch (error) {
        expect(error.message).toEqual(expect.stringContaining("ECONNREFUSED"));
      }
    });
  });
});
