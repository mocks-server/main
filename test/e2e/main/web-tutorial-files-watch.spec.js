/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { request, fixturesFolder, wait, BINARY_PATH } = require("../support/utils");
const InteractiveCliRunner = require("../support/InteractiveCliRunner");

describe("files watcher", () => {
  const cwdPath = path.resolve(__dirname, "fixtures");
  let interactiveCli;

  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    interactiveCli = new InteractiveCliRunner([BINARY_PATH, "--path=files-watch"], {
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
      expect(interactiveCli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
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
      await wait(2000);
    });

    describe("without changing current behavior", () => {
      it("should display available behaviors in CLI", async () => {
        expect(interactiveCli.logs).toEqual(expect.stringContaining("Behaviors: 4"));
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
});
