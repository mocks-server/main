/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const {
  mocksRunner,
  doFetch,
  waitForServer,
  fixturesFolder,
  removeConfigFile,
} = require("./support/helpers");

const configFile = path.resolve(fixturesFolder("temp"), "mocks.config.js");
const customStarter = path.resolve(fixturesFolder("temp"), "starter");

describe("when nor config file nor mocks folder exists", () => {
  let mocks;

  describe("When inited", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.ensureDir(fixturesFolder("temp"));
      await fsExtra.copy(fixturesFolder("starter"), customStarter);
      mocks = mocksRunner([], {
        customBinary: customStarter,
        cwd: fixturesFolder("temp"),
      });
      await waitForServer();
    });

    afterAll(async () => {
      removeConfigFile();
      await mocks.kill();
      await fsExtra.remove(fixturesFolder("temp"));
    });

    describe("when started for the first time", () => {
      it("should have created the mocks scaffold", async () => {
        expect(
          fsExtra.existsSync(path.resolve(fixturesFolder("temp"), "mocks", "mocks.json"))
        ).toEqual(true);
      });

      it("should have created the config file", async () => {
        expect(fsExtra.existsSync(configFile)).toEqual(true);
      });

      it("should serve users under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual([
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Doe" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });

      it("should serve user 1 under the /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });
    });

    describe("when stopped and started again", () => {
      beforeAll(async () => {
        await mocks.kill();
        mocks = mocksRunner([], {
          customBinary: customStarter,
          cwd: fixturesFolder("temp"),
        });
        await waitForServer();
      });

      it("should serve users under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual([
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Doe" },
        ]);
      });

      it("should serve user 1 under the /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });

      it("should serve user 1 under the /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");
        expect(users.status).toEqual(200);
        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });
    });
  });

  describe("When mocks folder already exists", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.ensureDir(fixturesFolder("temp"));
      await fsExtra.copy(
        fixturesFolder("files-error-routes"),
        path.resolve(fixturesFolder("temp"), "mocks")
      );
      await fsExtra.copy(fixturesFolder("starter"), customStarter);
      mocks = mocksRunner([], {
        customBinary: customStarter,
        cwd: fixturesFolder("temp"),
      });
      await waitForServer();
    });

    afterAll(async () => {
      await mocks.kill();
      await fsExtra.remove(fixturesFolder("temp"));
    });

    it("should have created the config file", async () => {
      expect(fsExtra.existsSync(configFile)).toEqual(true);
    });

    it("should have tried to load provided mocks", async () => {
      expect(mocks.logs.all).toEqual(expect.stringContaining("Mock with id 'user-2' is invalid"));
    });
  });

  describe("When readFile is disabled", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.ensureDir(fixturesFolder("temp"));
      await fsExtra.copy(fixturesFolder("starter"), customStarter);
      mocks = mocksRunner([], {
        customBinary: customStarter,
        cwd: fixturesFolder("temp"),
        env: {
          MOCKS_CONFIG_READ_FILE: false,
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await mocks.kill();
      await fsExtra.remove(fixturesFolder("temp"));
    });

    it("should have not created the config file", async () => {
      expect(fsExtra.existsSync(configFile)).toEqual(false);
    });

    it("should serve users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("When config file already exists", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.ensureDir(fixturesFolder("temp"));
      await fsExtra.copy(
        path.resolve(fixturesFolder("config-file-no-path"), "mocks.config.js"),
        path.resolve(fixturesFolder("temp"), "mocks.config.js")
      );
      await fsExtra.copy(fixturesFolder("starter"), customStarter);
      mocks = mocksRunner([], {
        customBinary: customStarter,
        cwd: fixturesFolder("temp"),
      });
      await waitForServer();
    });

    afterAll(async () => {
      await mocks.kill();
      await fsExtra.remove(fixturesFolder("temp"));
    });

    it("should have created the mocks scaffold", async () => {
      expect(
        fsExtra.existsSync(path.resolve(fixturesFolder("temp"), "mocks", "mocks.json"))
      ).toEqual(true);
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
