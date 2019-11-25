/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, request, wait, TimeCounter } = require("./utils");

describe("command line arguments", () => {
  const binaryPath = "./starter";
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  describe("behaviors option", () => {
    it("should set mocks folder", async () => {
      cli = new CliRunner([binaryPath, "--behaviors=web-tutorial"], {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });
  });

  describe("behavior option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner([binaryPath, "--behaviors=web-tutorial"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        cli = new CliRunner([binaryPath, "--behaviors=web-tutorial", "--behavior=dynamic"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner([binaryPath, "--behaviors=web-tutorial", "--behavior=foo"], {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner([binaryPath, "--behaviors=web-tutorial", "--behavior=foo"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });
  });

  describe("features option", () => {
    it("should set mocks folder", async () => {
      cli = new CliRunner([binaryPath, "--features=web-tutorial"], {
        cwd: cwdPath
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });
  });

  describe("feature option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner([binaryPath, "--features=web-tutorial"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        cli = new CliRunner([binaryPath, "--features=web-tutorial", "--feature=dynamic"], {
          cwd: cwdPath
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
      });
    });

    describe("when provided and does not exist", () => {
      it("should print a warning", async () => {
        cli = new CliRunner([binaryPath, "--features=web-tutorial", "--feature=foo"], {
          cwd: cwdPath
        });
        await wait();
        expect(cli.logs).toEqual(expect.stringContaining('Defined behavior "foo" was not found'));
      });

      it("should set as current behavior the first one found", async () => {
        cli = new CliRunner([binaryPath, "--features=web-tutorial", "--feature=foo"], {
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
      cli = new CliRunner([binaryPath, "--behaviors=web-tutorial", "--delay=2000"], {
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
});
