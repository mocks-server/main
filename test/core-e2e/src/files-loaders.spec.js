/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");
const fsExtra = require("fs-extra");
const { flatten } = require("lodash");
const {
  doFetch,
  fixturesFolder,
  waitForServer,
  wait,
  removeConfigFile,
  startCore,
} = require("./support/helpers");

describe("when files watch is disabled", () => {
  let core;

  beforeAll(async () => {
    await fsExtra.remove(fixturesFolder("temp"));
    await fsExtra.copy(fixturesFolder("yaml-files"), fixturesFolder("temp"));
    await fsExtra.move(
      path.resolve(fixturesFolder("temp"), "routes"),
      path.resolve(fixturesFolder("temp"), "custom-routes")
    );
    core = await startCore("temp", {
      files: {
        watch: false,
      },
    });
    const { loadRoutes } = core.mock.createLoaders();

    core.files.createLoader({
      id: "custom-routes",
      src: `custom-routes/**/*`,
      onLoad: (filesContents, _errors, { logger }) => {
        const routes = flatten(
          filesContents
            .map((fileDetails) => {
              return Array.isArray(fileDetails.content) ? fileDetails.content : null;
            })
            .filter((fileContent) => !!fileContent)
        );
        loadRoutes(routes);
        logger.verbose(`Loaded routes from folder "${core.files.path}/custom-routes"`);
      },
    });
    await core.files.reload();
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await fsExtra.remove(fixturesFolder("temp"));
    await core.stop();
  });

  describe("When started", () => {
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

  describe("When files are modified", () => {
    beforeAll(async () => {
      await fsExtra.copy(fixturesFolder("web-tutorial-modified"), fixturesFolder("temp"));
      await fsExtra.remove(path.resolve(fixturesFolder("temp"), "custom-routes"));
      await wait(4000);
    });

    it("should serve users in /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When files are reloaded", () => {
    beforeAll(async () => {
      await core.files.reload();
      await wait(4000);
    });

    it("should serve users modified in /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.headers.get("x-custom-header")).toEqual("foo-header");
      expect(users.headers.get("x-another-header")).toEqual("another-header");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
      ]);
    });

    it("should serve new users in /api/new-users path", async () => {
      const users = await doFetch("/api/new-users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
        { id: 3, name: "Brand new user" },
      ]);
    });
  });
});
