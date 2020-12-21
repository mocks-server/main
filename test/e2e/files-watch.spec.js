/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { CliRunner, request, fixturesFolder, wait } = require("./utils");

describe("files watcher", () => {
  const binaryPath = "./starter";
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  beforeAll(async () => {
    fsExtra.removeSync(fixturesFolder("files-watch"));
    fsExtra.copySync(fixturesFolder("web-tutorial"), fixturesFolder("files-watch"));
    cli = new CliRunner([binaryPath, "--path=files-watch"], {
      cwd: cwdPath,
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When started", () => {
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
      await wait(4000);
    });

    describe("without changing current behavior", () => {
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
        await cli.kill();
        cli = new CliRunner([binaryPath, "--path=files-watch", "--behavior=user2"], {
          cwd: cwdPath,
        });
        await wait();
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
        await cli.kill();
        cli = new CliRunner([binaryPath, "--path=files-watch", "--behavior=dynamic"], {
          cwd: cwdPath,
        });
        await wait();
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
        await cli.kill();
        cli = new CliRunner([binaryPath, "--path=files-watch", "--behavior=newOne"], {
          cwd: cwdPath,
        });
        await wait();
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
