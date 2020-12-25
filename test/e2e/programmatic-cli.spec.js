/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { CliRunner, request, wait, TimeCounter, fixturesFolder } = require("./support/utils");

describe("programmatic Cli", () => {
  const cwdPath = fixturesFolder("programmatic-cli");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should set mocks folder", async () => {
      expect.assertions(2);
      cli = new CliRunner("start.js", {
        cwd: cwdPath,
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });

    it("should set mocks folder even when deprecated features option is received", async () => {
      expect.assertions(3);
      cli = new CliRunner("start-features.js", {
        cwd: cwdPath,
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(cli.logs).toEqual(
        expect.stringContaining(
          "Deprecation warning: --features option will be deprecated. Use --path instead"
        )
      );
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });

    it("should set mocks folder even when deprecated behaviors option is received", async () => {
      expect.assertions(3);
      cli = new CliRunner("start-behaviors.js", {
        cwd: cwdPath,
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(cli.logs).toEqual(
        expect.stringContaining(
          "Deprecation warning: --behaviors option will be deprecated. Use --path instead"
        )
      );
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });

    it("should print a log when started", async () => {
      cli = new CliRunner("start.js", {
        cwd: cwdPath,
      });
      await wait();
      expect(cli.logs).toEqual(expect.stringContaining("Server started"));
    });
  });

  describe("behavior option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner("start.js", {
          cwd: cwdPath,
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
        cli = new CliRunner("start-dynamic-behavior.js", {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });
    });

    describe("when provided and exists, and using deprecated behaviors option", () => {
      it("should set current behavior", async () => {
        expect.assertions(2);
        cli = new CliRunner("deprecated-start-dynamic-behavior.js", {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner("start-unexistant-behavior.js", {
          cwd: cwdPath,
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner("start-unexistant-behavior.js", {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });
  });

  describe("feature option", () => {
    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        expect.assertions(2);
        cli = new CliRunner("start-dynamic-feature.js", {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });

      it("should print a deprecation warning", async () => {
        cli = new CliRunner("start-dynamic-feature.js", {
          cwd: cwdPath,
        });
        await wait();
        expect(cli.logs).toEqual(
          expect.stringContaining(
            "Deprecation warning: --feature option will be deprecated. Use --behavior instead"
          )
        );
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner("start-unexistant-feature.js", {
          cwd: cwdPath,
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner("start-unexistant-feature.js", {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });
  });

  describe("delay option", () => {
    it("should set delay", async () => {
      expect.assertions(2);
      cli = new CliRunner("start-delay.js", {
        cwd: cwdPath,
      });
      await wait();
      const timeCounter = new TimeCounter();
      const users = await request("/api/users");
      timeCounter.stop();
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("when initializing server manually and start after", () => {
    it("should start server without cli, then start", async () => {
      expect.assertions(3);
      cli = new CliRunner("init-server.js", {
        cwd: cwdPath,
      });
      await wait();
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 1, name: "John Doe" });
      expect(cli.logs).toEqual(expect.not.stringContaining("Select action"));
      await wait(3000);
      expect(cli.logs).toEqual(expect.stringContaining("Select action"));
    });
  });
});
