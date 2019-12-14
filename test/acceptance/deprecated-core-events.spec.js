/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const {
  request,
  deprecatedChangeBehavior,
  deprecatedGetBehaviors,
  fixturesFolder,
  wait,
  CliRunner
} = require("./utils");

describe("Plugin listening to core events", () => {
  let cli;

  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    cli = new CliRunner(["node", "start-files-watch.js"], {
      cwd: path.resolve(__dirname, "fixtures")
    });
    await wait(1000);
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When server is started", () => {
    it("should have 3 behaviors available", async () => {
      const behaviors = await deprecatedGetBehaviors();
      expect(behaviors.length).toEqual(3);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
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
      it("should have 4 behaviors available", async () => {
        const behaviors = await deprecatedGetBehaviors();
        expect(behaviors.length).toEqual(4);
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" }
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
        await deprecatedChangeBehavior("user2");
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" }
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
        await deprecatedChangeBehavior("dynamic");
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/users");
        expect(users).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" }
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
        await deprecatedChangeBehavior("newOne");
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await request("/api/new-users");
        expect(users).toEqual([
          { id: 1, name: "John Doe new" },
          { id: 2, name: "Jane Doe new" }
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
