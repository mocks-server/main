/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { request, fixturesFolder, wait, pathJoin, BINARY_PATH } = require("./support/utils");
const InteractiveCliRunner = require("../../inquirer/support/InteractiveCliRunner");

describe("files watcher", () => {
  jest.setTimeout(15000);
  const cwdPath = path.resolve(__dirname, "fixtures");
  let interactiveCli;

  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    interactiveCli = new InteractiveCliRunner([BINARY_PATH, "--pathLegacy=files-watch"], {
      cwd: cwdPath,
    });
    await wait();
  });

  afterAll(async () => {
    await interactiveCli.kill();
  });

  describe("When started", () => {
    it("should display available behaviors in CLI", async () => {
      await wait(500);
      expect(interactiveCli.logs).toEqual(expect.stringContaining("behaviors: 3"));
    });

    it("should display current behavior in CLI", async () => {
      expect(interactiveCli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
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

  describe("When files are modified", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("files-modification"), fixturesFolder("files-watch"));
      await wait(5000);
    });

    describe("without changing current behavior", () => {
      it("should display available behaviors in CLI", async () => {
        expect(interactiveCli.currentScreen).toEqual(expect.stringContaining("behaviors: 4"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await request("/api/users/1");
        expect(users).toEqual({ id: 1, name: "John Doe modified" });
      });

      it("should serve user 1 under the /api/users/2 path", async () => {
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe modified" });
      });
    });

    describe('When changing current behavior to "user2"', () => {
      beforeAll(async () => {
        await interactiveCli.cursorDown(8);
        await interactiveCli.pressEnter();
        await interactiveCli.cursorDown();
        await interactiveCli.pressEnter();
      });

      it("should display current behavior in CLI", async () => {
        await wait(500);
        expect(interactiveCli.logs).toEqual(expect.stringContaining("Current behavior: user2"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 2 under the /api/users/1 path", async () => {
        const users = await request("/api/users/1");
        expect(users).toEqual({ id: 2, name: "Jane Doe modified" });
      });

      it("should serve user 2 under the /api/users/2 path", async () => {
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe modified" });
      });
    });

    describe('When changing current behavior to "dynamic"', () => {
      beforeAll(async () => {
        await interactiveCli.cursorDown(8);
        await interactiveCli.pressEnter();
        await interactiveCli.cursorDown(2);
        await interactiveCli.pressEnter();
      });

      it("should display current behavior in CLI", async () => {
        await wait(500);
        expect(interactiveCli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await request("/api/users/1");
        expect(users).toEqual({ id: 1, name: "John Doe modified" });
      });

      it("should serve user 2 under the /api/users/2 path", async () => {
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe modified" });
      });
    });

    describe('When changing current behavior to "newOne"', () => {
      beforeAll(async () => {
        await interactiveCli.cursorDown(8);
        await interactiveCli.pressEnter();
        await interactiveCli.cursorDown(3);
        await interactiveCli.pressEnter();
      });

      it("should display current behavior in CLI", async () => {
        await wait(500);
        expect(interactiveCli.logs).toEqual(expect.stringContaining("Current behavior: newOne"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/new-users");
        expect(users).toEqual([
          { id: 1, name: "John Doe new" },
          { id: 2, name: "Jane Doe new" },
        ]);
      });

      it("should serve user 1 under the /api/new-users/1 path", async () => {
        const users = await request("/api/new-users/1");
        expect(users).toEqual({ id: 1, name: "John Doe new" });
      });

      it("should serve user 1 under the /api/new-users/2 path", async () => {
        const users = await request("/api/new-users/2");
        expect(users).toEqual({ id: 1, name: "John Doe new" });
      });
    });
  });

  describe("When files are modified and contain an error", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("files-error"), fixturesFolder("files-watch"));
      await wait(2000);
    });

    it("should display an error", async () => {
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining("Error: Error loading files from legacy folder")
      );
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining(
          `${pathJoin("main", "v1", "fixtures", "files-watch")}: FOO is not defined`
        )
      );
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining(`${pathJoin("files-watch", "fixtures", "users.js")}:2:18`)
      );
    });

    it("should have same behaviors than before available", async () => {
      expect(interactiveCli.currentScreen).toEqual(expect.stringContaining("behaviors: 4"));
    });

    it("should still serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/new-users");
      expect(users).toEqual([
        { id: 1, name: "John Doe new" },
        { id: 2, name: "Jane Doe new" },
      ]);
    });

    it("should remove alerts when error is fixed", async () => {
      fsExtra.copySync(fixturesFolder("files-modification"), fixturesFolder("files-watch"));
      await wait(3000);
      expect(interactiveCli.currentScreen).toEqual(
        expect.not.stringContaining(
          `${pathJoin("main", "v1", "fixtures", "files-watch")}: FOO is not defined`
        )
      );
    });
  });

  describe("When files are modified while displaying logs", () => {
    it("should display logs", async () => {
      await interactiveCli.cursorDown(7);
      await interactiveCli.pressEnter();
      await wait(1000);
      expect(interactiveCli.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
    });

    it("should not display alerts when files are modified and contain an error", async () => {
      expect.assertions(2);
      fsExtra.copySync(fixturesFolder("files-error"), fixturesFolder("files-watch"));
      await wait(2000);
      expect(interactiveCli.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
      expect(interactiveCli.currentScreen).toEqual(
        expect.not.stringContaining("Error: Error loading files from legacy folder")
      );
    });

    it("should have displayed error in logs", async () => {
      expect.assertions(2);
      expect(interactiveCli.currentScreen).toEqual(
        expect.not.stringContaining("Error: Error loading files from legacy folder")
      );
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining("Error loading files from legacy folder")
      );
    });

    it("should display alerts when exit logs mode", async () => {
      expect.assertions(3);
      await interactiveCli.pressEnter();
      await wait(2000);
      expect(interactiveCli.currentScreen).toEqual(expect.not.stringContaining("Displaying logs"));
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining("Error: Error loading files from legacy folder")
      );
      expect(interactiveCli.currentScreen).toEqual(
        expect.stringContaining(`${pathJoin("files-watch", "fixtures", "users.js")}:2:18`)
      );
    });

    it("should remove alerts when error is fixed", async () => {
      expect.assertions(2);
      fsExtra.copySync(fixturesFolder("files-modification"), fixturesFolder("files-watch"));
      await wait(2000);
      expect(interactiveCli.currentScreen).toEqual(
        expect.not.stringContaining("Error: Error loading files from legacy folder")
      );
      expect(interactiveCli.currentScreen).toEqual(expect.stringContaining("CURRENT SETTINGS"));
    });
  });
});
