/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const {
  mocksRunner,
  doFetch,
  waitForServerAndCli,
  wait,
  fixturesFolder,
} = require("./support/helpers");

describe("files watcher", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("temp"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("temp"));
    mocks = mocksRunner(["--files.path=temp"]);
    await waitForServerAndCli();
  });

  afterAll(async () => {
    await mocks.kill();
  });

  describe("When started", () => {
    it("should display available collections in CLI", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 3"));
    });

    it("should display current collection in CLI", async () => {
      expect(mocks.logs).toEqual(expect.stringContaining("Current collection: base"));
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

  describe("When files are modified", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await wait(5000);
    });

    describe("without changing current mock", () => {
      it("should display available mocks in CLI", async () => {
        expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 4"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.body).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");
        expect(users.body).toEqual({ id: 1, name: "John Doe modified" });
      });

      it("should serve user 1 under the /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 1, name: "John Doe modified" });
      });
    });

    describe('When changing current collection to "user-2"', () => {
      beforeAll(async () => {
        await mocks.pressEnter();
        await mocks.cursorDown();
        await mocks.pressEnter();
      });

      it("should display current collection in CLI", async () => {
        await wait(500);
        expect(mocks.logs).toEqual(expect.stringContaining("Current collection: user-2"));
      });

      it("should serve users collection under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.body).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 2 under the /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe modified" });
      });

      it("should serve user 2 under the /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe modified" });
      });
    });

    describe('When changing current mock to "user-real"', () => {
      beforeAll(async () => {
        await mocks.pressEnter();
        await mocks.cursorDown(2);
        await mocks.pressEnter();
      });

      it("should display current behavior in CLI", async () => {
        await wait(500);
        expect(mocks.logs).toEqual(expect.stringContaining("Current collection: user-real"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.body).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");
        expect(users.body).toEqual({ id: 1, name: "John Doe modified" });
      });

      it("should serve user 2 under the /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");
        expect(users.body).toEqual({ id: 2, name: "Jane Doe modified" });
      });
    });
  });

  describe("When files are modified and contain an error", () => {
    beforeAll(async () => {
      fsExtra.copySync(fixturesFolder("files-error-mock"), fixturesFolder("temp"));
      await wait(5000);
    });

    it("should display an error", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Error: [files:load"));
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Error loading file"));
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining(`collections.js: foo is not defined`)
      );
      expect(mocks.currentScreen).toEqual(expect.stringContaining(`collections.js:11:18`));
    });

    it("should have no mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 0"));
    });

    it("should not serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(404);
    });

    it("should remove alerts when error is fixed", async () => {
      fsExtra.copySync(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await wait(5000);
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
    });
  });

  describe("When files are modified while displaying logs", () => {
    it("should display logs", async () => {
      await mocks.cursorDown(7);
      await mocks.pressEnter();
      await wait(1000);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
    });

    it("should not display alerts when files are modified and contain an error", async () => {
      expect.assertions(2);
      fsExtra.copySync(fixturesFolder("files-error-mock"), fixturesFolder("temp"));
      await wait(3000);
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Displaying logs"));
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
    });

    it("should have displayed error in logs", async () => {
      expect.assertions(2);
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
      expect(mocks.currentScreen).toEqual(
        expect.stringContaining("[error][alerts:files:load] Error loading file")
      );
    });

    it("should display alerts when exit logs mode", async () => {
      expect.assertions(4);
      await mocks.pressEnter();
      await wait(2000);
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("Displaying logs"));
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Error: [files:load"));
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Error loading file"));
      expect(mocks.currentScreen).toEqual(expect.stringContaining("ALERTS"));
    });

    it("should remove alerts when error is fixed", async () => {
      expect.assertions(2);
      fsExtra.copySync(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await wait(4000);
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("ALERTS"));
      expect(mocks.currentScreen).toEqual(expect.stringContaining("CURRENT SETTINGS"));
    }, 10000);
  });
});
