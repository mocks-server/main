/*
Copyright 2021-2022 Javier Brea

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
  wait,
} = require("./support/helpers");

describe("Quick start tutorial", () => {
  const FOLDER = "unexistant";
  const quickStartModified = fixturesFolder("quick-start-modified");
  let core, changeCollection, useRouteVariant, changeFilesPath;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder(FOLDER));
    core = await startCore(FOLDER);
    changeCollection = (name) => {
      core.mock.collections.select(name);
    };
    useRouteVariant = (name) => {
      core.mock.useRouteVariant(name);
    };
    changeFilesPath = (folder) => {
      core.config.namespace("files").option("path").value = folder;
    };
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await fsExtra.remove(fixturesFolder(FOLDER));
    await core.stop();
  });

  describe("when started", () => {
    it("should have created folder", async () => {
      expect(fsExtra.existsSync(fixturesFolder(FOLDER))).toEqual(true);
    });

    it("should have created routes folder", async () => {
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "routes"))).toEqual(true);
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "collections.json"))).toEqual(
        true
      );
    });

    it("should have created config file", async () => {
      expect(fsExtra.existsSync(path.resolve(fixturesFolder(FOLDER), "collections.json"))).toEqual(
        true
      );
    });

    it("should have added an alert about folder not found", async () => {
      expect(findAlert("scaffold:folder", core.alerts.flat).message).toEqual(
        expect.stringContaining("Mocks Server folder was not found")
      );
    });

    it("should have four collections", async () => {
      expect(core.mock.collections.plain.length).toEqual(4);
    });

    it("should have three routes", async () => {
      expect(core.mock.routes.plain.length).toEqual(3);
    });

    it("should have 8 variants", async () => {
      expect(core.mock.routes.plainVariants.length).toEqual(8);
    });
  });

  describe("base mock", () => {
    it("should serve 2 users under the /api/users path", async () => {
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

  describe("when selecting all-users collection", () => {
    beforeAll(() => {
      changeCollection("all-users");
    });

    it("should serve 4 users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
        { id: 3, name: "Tommy" },
        { id: 4, name: "Timmy" },
      ]);
    });

    it("should serve user 3 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 3, name: "Tommy" });
    });

    it("should serve user 3 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 3, name: "Tommy" });
    });
  });

  describe("when using get-user:success route variant", () => {
    beforeAll(() => {
      useRouteVariant("get-user:success");
    });

    it("should serve 4 users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
        { id: 3, name: "Tommy" },
        { id: 4, name: "Timmy" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("when adding a route variant", () => {
    beforeAll(async () => {
      changeFilesPath(quickStartModified);
      await wait(3000);
      useRouteVariant("get-user:id-2");
    });

    it("should serve 4 users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
        { id: 3, name: "Tommy" },
        { id: 4, name: "Timmy" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe("when adding a collection", () => {
    beforeAll(async () => {
      changeCollection("all-users-user-2");
    });

    it("should serve 4 users under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
        { id: 3, name: "Tommy" },
        { id: 4, name: "Timmy" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
