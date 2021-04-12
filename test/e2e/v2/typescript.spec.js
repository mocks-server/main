/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServer, fixturesFolder, wait } = require("./support/helpers");

describe("when babelRegister is enabled and typescript files are used", () => {
  let mocks;

  describe("When started", () => {
    beforeAll(async () => {
      mocks = mocksRunner([], {
        cwd: fixturesFolder("typescript-config"),
      });
      await waitForServer();
      await wait(3000);
    });

    afterAll(async () => {
      await mocks.kill();
    });

    it("should have log level silly", async () => {
      expect(mocks.logs).toEqual(expect.stringContaining("[Mocks silly]"));
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
      expect(users.headers.get("x-mocks-server-example")).toEqual("custom-header-typescript");
      expect(mocks.logs).toEqual(
        expect.stringContaining(
          "Custom header added by add-headers:enabled route variant middleware using TypeScript"
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
  });
});
