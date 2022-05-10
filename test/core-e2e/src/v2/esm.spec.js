/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const { mocksRunner, fetch, waitForServer, fixturesFolder, wait } = require("./support/helpers");

describe("when babelRegister is enabled and esm files are used", () => {
  let mocks;

  describe("When started", () => {
    beforeAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await fsExtra.copy(fixturesFolder("esm"), fixturesFolder("temp"));
      mocks = mocksRunner([], {
        cwd: fixturesFolder("esm-config"),
      });
      await waitForServer();
      await wait(3000);
    });

    afterAll(async () => {
      await fsExtra.remove(fixturesFolder("temp"));
      await mocks.kill();
    });

    it("should have log level silly", async () => {
      expect(mocks.logs.joined).toEqual(expect.stringContaining("[Mocks silly]"));
    });

    it("should serve users in /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should trace request and add headers", async () => {
      const users = await fetch("/api/users");
      expect(users.headers.get("x-mocks-server-example")).toEqual("custom-header");
      expect(mocks.logs.joined).toEqual(
        expect.stringContaining(
          "Custom header added by add-headers:enabled route variant middleware"
        )
      );
    });

    it("should serve user 1 in /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 in /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should reload mocks when files are modified", async () => {
      await fsExtra.copy(fixturesFolder("esm-modified"), fixturesFolder("temp"));
      await wait(4000);
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
      ]);
    });

    it("should serve new users route", async () => {
      const users = await fetch("/api/new-users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe modified" },
        { id: 2, name: "Jane Doe modified" },
        { id: 3, name: "Brand new user" },
      ]);
    });

    it("middleware should be disabled", async () => {
      const users = await fetch("/api/users");
      expect(users.headers.get("x-mocks-server-example")).toEqual(null);
    });
  });
});
