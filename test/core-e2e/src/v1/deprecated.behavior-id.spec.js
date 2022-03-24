/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, startCore, stopCore, request, wait } = require("./support/helpers");

describe("when behavior ids are defined using object keys", () => {
  const binaryPath = "./starter";
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;
  let core;

  describe("number of behaviors and fixtures", () => {
    beforeAll(async () => {
      core = await startCore("web-tutorial-deprecated-ids");
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("should have three behaviors", async () => {
      expect(core.behaviors.count).toEqual(3);
    });

    it("should have four fixtures", async () => {
      expect(core.fixtures.count).toEqual(4);
    });
  });

  describe('When started with "standard" behavior', () => {
    beforeAll(async () => {
      cli = new CliRunner(
        [binaryPath, "--pathLegacy=web-tutorial-deprecated-ids", "--behavior=standard"],
        {
          cwd: cwdPath,
        }
      );
      await wait();
    });

    afterAll(async () => {
      await cli.kill();
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

  describe('When started with "user2" behavior', () => {
    beforeAll(async () => {
      cli = new CliRunner(
        [binaryPath, "--pathLegacy=web-tutorial-deprecated-ids", "--behavior=user2"],
        {
          cwd: cwdPath,
        }
      );
      await wait();
    });

    afterAll(async () => {
      await cli.kill();
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('When started with "dynamic" behavior', () => {
    beforeAll(async () => {
      cli = new CliRunner(
        [binaryPath, "--pathLegacy=web-tutorial-deprecated-ids", "--behavior=dynamic"],
        {
          cwd: cwdPath,
        }
      );
      await wait();
    });

    afterAll(async () => {
      await cli.kill();
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

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await request("/api/users/3", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(usersResponse.statusCode).toEqual(404);
    });
  });
});
