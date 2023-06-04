/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServer,
  fixturesFolder,
  wait,
  removeConfigFile,
} = require("../support/helpers");

describe("when babelRegister is enabled and typescript files are used", () => {
  let mocks;

  const runTests = (config) => {
    describe(`When started using ${config} config`, () => {
      beforeAll(async () => {
        mocks = mocksRunner([], {
          cwd: fixturesFolder(config),
        });
        await waitForServer();
        await wait(3000);
      });

      afterAll(async () => {
        removeConfigFile();
        await mocks.kill();
      });

      it("should have log level silly", async () => {
        expect(mocks.logs.current).toEqual(expect.stringContaining("[silly]"));
      });

      it("should serve users in /api/users path", async () => {
        const users = await doFetch("/api/users");

        expect(users.body).toEqual([
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Doe" },
        ]);
      });

      it("should serve books in /api/books path", async () => {
        const users = await doFetch("/api/books");

        expect(users.body).toEqual([
          { id: 1, title: "1984" },
          { id: 2, title: "Brave New World" },
        ]);
      });

      it("middleware should trace request and add headers", async () => {
        const users = await doFetch("/api/users");

        expect(users.headers.get("x-mocks-server-example")).toEqual("custom-header-typescript");
        expect(mocks.logs.current).toEqual(
          expect.stringContaining(
            "Custom header added by add-headers:enabled route variant middleware using TypeScript"
          )
        );
      });

      it("should serve user 1 in /api/users/1 path", async () => {
        const users = await doFetch("/api/users/1");

        expect(users.body).toEqual({ id: 1, name: "John Doe" });
      });

      it("should serve user 2 in /api/users/2 path", async () => {
        const users = await doFetch("/api/users/2");

        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
      });
    });
  };

  runTests("typescript-config");
  runTests("typescript-custom-config");
});
