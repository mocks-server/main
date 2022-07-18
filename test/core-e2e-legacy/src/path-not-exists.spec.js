/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const {
  startCore,
  doFetch,
  fixturesFolder,
  waitForServer,
  findAlert,
  removeConfigFile,
} = require("./support/helpers");

describe("when path not exists", () => {
  const FOLDER = "unexistant";
  let core, changeMock;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder(FOLDER));
    core = await startCore(FOLDER);
    changeMock = (name) => {
      core.config.namespace("mocks").option("selected").value = name;
    };
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await fsExtra.remove(fixturesFolder(FOLDER));
    await core.stop();
  });

  describe("scaffold", () => {
    it("should have created folder", async () => {
      expect(fsExtra.existsSync(fixturesFolder(FOLDER))).toEqual(true);
    });

    it("should have created scaffold folder", async () => {
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "routes"))).toEqual(true);
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "collections.json"))).toEqual(
        true
      );
    });

    it("should have added an alert about folder not found", async () => {
      expect(findAlert("scaffold:folder", core.alerts).message).toEqual(
        expect.stringContaining("Mocks Server folder was not found")
      );
    });

    it("should have three mocks", async () => {
      expect(core.mocks.plainMocks.length).toEqual(3);
    });

    it("should have three routes", async () => {
      expect(core.mocks.plainRoutes.length).toEqual(3);
    });

    it("should have six routes", async () => {
      expect(core.mocks.plainRoutesVariants.length).toEqual(6);
    });
  });

  describe("base mock", () => {
    it("should serve users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.headers.get("x-mocks-server-example")).toEqual("some-value");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.headers.get("x-mocks-server-example")).toEqual("some-value");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.headers.get("x-mocks-server-example")).toEqual("some-value");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("no-headers mock", () => {
    it("should not add headers to /api/users", async () => {
      changeMock("no-headers");
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should not add headers to /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should not add headers to /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("user-real mock", () => {
    it("should serve users under the /api/users path", async () => {
      changeMock("user-real");
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
