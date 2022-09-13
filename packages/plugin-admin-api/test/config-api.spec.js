/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startServer,
  doFetch,
  doApiFetch,
  fixturesFolder,
  TimeCounter,
  wait,
  waitForServer,
} = require("./support/helpers");

describe("settings api", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get", () => {
    it("should return current config", async () => {
      const settingsResponse = await doApiFetch("/config");
      expect(settingsResponse.body).toEqual({
        config: {
          allowUnknownArguments: true,
          readArguments: false,
          readEnvironment: false,
          readFile: false,
        },
        mock: {
          collections: {},
          routes: {
            delay: 0,
          },
        },
        files: {
          enabled: true,
          babelRegister: {
            enabled: false,
            options: {},
          },
          path: fixturesFolder("web-tutorial"),
          watch: false,
        },
        plugins: {
          register: [null],
          adminApi: {
            host: "0.0.0.0",
            port: 3110,
            https: {
              enabled: false,
            },
          },
        },
        log: "silent",
        server: {
          host: "0.0.0.0",
          port: 3100,
          cors: {
            enabled: true,
            options: {
              preflightContinue: false,
            },
          },
          jsonBodyParser: {
            enabled: true,
            options: {},
          },
          urlEncodedBodyParser: {
            enabled: true,
            options: {
              extended: true,
            },
          },
          https: {
            enabled: false,
          },
        },
        variantHandlers: {
          register: [],
        },
      });
    });
  });

  describe("patch", () => {
    describe("when changing an unexistant option", () => {
      it("should response with a bad request containing errors", async () => {
        expect.assertions(4);
        const settingsResponse = await doApiFetch("/config", {
          method: "PATCH",
          body: {
            foo: "foo-value",
            anotherFoo: 45,
            third: {
              foo: "foo",
            },
          },
        });
        expect(settingsResponse.status).toEqual(400);
        expect(settingsResponse.body.message).toEqual(expect.stringContaining("foo"));
        expect(settingsResponse.body.message).toEqual(expect.stringContaining("anotherFoo"));
        expect(settingsResponse.body.message).toEqual(expect.stringContaining("third"));
      });

      it("should not apply any change if request contains any error", async () => {
        expect.assertions(3);
        const settingsUpdateResponse = await doApiFetch("/config", {
          method: "PATCH",
          body: {
            foo: "foo-value",
            delay: 1000,
          },
        });
        const settingsResponse = await doApiFetch("/config");
        expect(settingsUpdateResponse.status).toEqual(400);
        expect(settingsUpdateResponse.body.message).toEqual(expect.stringContaining("foo"));
        expect(settingsResponse.body.mock.routes.delay).toEqual(0);
      });
    });

    describe("when changing delay option", () => {
      it("should respond with no delay", async () => {
        const timeCounter = new TimeCounter();
        await doFetch("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeLessThan(200);
      });

      it("should set delay option and have effect on server response time", async () => {
        const timeCounter = new TimeCounter();
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            mock: {
              routes: {
                delay: 2000,
              },
            },
          },
        });
        await doFetch("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeGreaterThan(2000);
      });

      it("should set delay option to 0", async () => {
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            mock: {
              routes: {
                delay: 0,
              },
            },
          },
        });
        const timeCounter = new TimeCounter();
        await doFetch("/api/users");
        timeCounter.stop();
        expect(timeCounter.total).toBeLessThan(200);
      });
    });

    describe("when changing collection option", () => {
      describe("without changing it", () => {
        it("should serve user 1 under the /api/users/1 path", async () => {
          const users = await doFetch("/api/users/1");
          expect(users.body).toEqual({ id: 1, name: "John Doe" });
        });

        it("should serve user 1 under the /api/users/2 path", async () => {
          const users = await doFetch("/api/users/2");
          expect(users.body).toEqual({ id: 1, name: "John Doe" });
        });
      });

      describe('changing it to "user-2"', () => {
        beforeAll(async () => {
          await doApiFetch("/config", {
            method: "PATCH",
            body: {
              mock: {
                collections: {
                  selected: "user-2",
                },
              },
            },
          });
        });

        it("should return new collection when getting settings", async () => {
          const settingsResponse = await doApiFetch("/config");
          expect(settingsResponse.body.mock.collections.selected).toEqual("user-2");
        });

        it("should serve user 2 under the /api/users/1 path", async () => {
          const users = await doFetch("/api/users/1");
          expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
        });

        it("should serve user 2 under the /api/users/2 path", async () => {
          const users = await doFetch("/api/users/2");
          expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
        });
      });
    });

    describe("when changing path option", () => {
      beforeAll(async () => {
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            files: {
              path: fixturesFolder("web-tutorial-modified"),
            },
          },
        });
        await wait(1000);
      });

      afterAll(async () => {
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            files: {
              path: fixturesFolder("web-tutorial"),
            },
          },
        });
        await wait(1000);
      });

      it("should return new path option when getting settings", async () => {
        const settingsResponse = await doApiFetch("/config");
        expect(settingsResponse.body.files.path).toEqual(fixturesFolder("web-tutorial-modified"));
      });

      it("should serve users collection mock under the /api/users path", async () => {
        const users = await doFetch("/api/users");
        expect(users.body).toEqual([
          { id: 1, name: "John Doe modified" },
          { id: 2, name: "Jane Doe modified" },
        ]);
      });
    });

    describe("when changing port option", () => {
      beforeAll(async () => {
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            server: {
              port: 3200,
            },
          },
        });
        await waitForServer(3200);
      });

      afterAll(async () => {
        await doApiFetch("/config", {
          method: "PATCH",
          body: {
            server: {
              port: 3100,
            },
          },
        });
        await waitForServer();
      });

      it("should serve user 2 under the /api/users/1 path using new port", async () => {
        const users = await doFetch("/api/users/1", {
          port: 3200,
        });
        expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
      });
    });
  });
});
