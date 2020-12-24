/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");

const {
  startCore,
  stopCore,
  request,
  fixturesFolder,
  wait,
  TimeCounter,
} = require("./support/helpers");

describe("plugins", () => {
  const FOO_CUSTOM_RESPONSE = {
    foo: "foo",
  };
  let core;
  let customRouter;
  let sandbox;
  let changeSettingsSpy;
  let filesLoadedSpy;
  let mocksLoadedSpy;
  let initSpy;
  let registerSpy;
  let startSpy;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    changeSettingsSpy = sandbox.spy();
    filesLoadedSpy = sandbox.spy();
    mocksLoadedSpy = sandbox.spy();
    initSpy = sandbox.spy();
    registerSpy = sandbox.spy();
    startSpy = sandbox.spy();
    customRouter = express.Router();
    customRouter.get("/", (req, res) => {
      res.status(200);
      res.send(FOO_CUSTOM_RESPONSE);
    });
  });

  afterAll(() => {
    sandbox.restore();
  });

  const testPlugin = (description, pluginConstructor) => {
    describe(description, () => {
      beforeAll(async () => {
        core = await startCore("web-tutorial", {
          plugins: [pluginConstructor],
        });
      });

      afterAll(async () => {
        sandbox.reset();
        await stopCore(core);
      });

      describe("when started", () => {
        it("should start server and send responses", async () => {
          const users = await request("/api/users");
          expect(users).toEqual([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
          ]);
        });

        it("should have executed register method passing core", async () => {
          expect(registerSpy.callCount).toEqual(1);
        });

        it("should have passed core to register method", async () => {
          expect(initSpy.getCall(0).args[0]).toEqual(core);
        });

        it("should have executed init method when settings are available", async () => {
          expect(initSpy.callCount).toEqual(1);
        });

        it("should have settings available when init is called", async () => {
          expect.assertions(3);
          expect(initSpy.getCall(0).args[1]).toEqual(fixturesFolder("web-tutorial"));
          expect(initSpy.getCall(0).args[2]).toEqual(3100);
          expect(initSpy.getCall(0).args[3]).toEqual(0);
        });

        it("should have passed core to init method", async () => {
          expect(initSpy.getCall(0).args[0]).toEqual(core);
        });

        it("should have executed start method", async () => {
          expect(startSpy.callCount).toEqual(1);
        });

        it("should have passed core to start method", async () => {
          expect(startSpy.getCall(0).args[0]).toEqual(core);
        });

        it("should respond to custom routes", async () => {
          const response = await request("/foo-path");
          expect(response).toEqual(FOO_CUSTOM_RESPONSE);
        });
      });

      describe("when emit events", () => {
        beforeAll(async () => {
          core.settings.set("behaviors", fixturesFolder("files-modification"));
          await wait(4000);
        });

        it("should inform plugin when settings are changed", async () => {
          expect(changeSettingsSpy.getCall(1).args[0]).toEqual({
            path: fixturesFolder("files-modification"),
          });
        });

        it("should inform plugin when files are loaded", async () => {
          expect(filesLoadedSpy.callCount).toEqual(1);
        });

        it("should inform plugin when mocks are loaded", async () => {
          expect(mocksLoadedSpy.callCount).toEqual(2);
        });
      });
    });
  };

  const testAsyncPlugin = (description, pluginConstructor) => {
    describe(`${description} with async methods`, () => {
      afterEach(async () => {
        sandbox.reset();
        await stopCore(core);
      });

      describe("when started", () => {
        it("should start server when all initialization is finished", async () => {
          const timeCounter = new TimeCounter();
          core = await startCore("web-tutorial", {
            plugins: [pluginConstructor],
          });
          const users = await request("/api/users");
          expect(users).toEqual([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
          ]);
          timeCounter.stop();
          expect(timeCounter.total).toBeGreaterThan(3000);
        });
      });
    });
  };

  testPlugin("created as an object", {
    register: (coreInstance) => {
      coreInstance.addCustomRouter("/foo-path", customRouter);
      registerSpy(coreInstance);
    },
    init: (coreInstance) => {
      initSpy(
        coreInstance,
        coreInstance.settings.get("behaviors"),
        coreInstance.settings.get("port"),
        coreInstance.settings.get("delay")
      );
      coreInstance.settings.set("log", "silly");
      coreInstance.onChangeSettings(changeSettingsSpy);
      coreInstance.onLoadMocks(mocksLoadedSpy);
      coreInstance.onLoadFiles(filesLoadedSpy);
    },
    start: (coreInstance) => {
      startSpy(coreInstance);
    },
  });

  testAsyncPlugin("created as an object", {
    // TODO, allow async register
    init: () => {
      return wait(2000);
    },
    start: () => {
      return wait(1000);
    },
  });

  testPlugin(
    "created as a Class",
    class Plugin {
      constructor(coreInstance) {
        coreInstance.addCustomRouter("/foo-path", customRouter);
        registerSpy(coreInstance);
      }
      init(coreInstance) {
        initSpy(
          coreInstance,
          coreInstance.settings.get("behaviors"),
          coreInstance.settings.get("port"),
          coreInstance.settings.get("delay")
        );
        coreInstance.settings.set("log", "silly");
        coreInstance.onChangeSettings(changeSettingsSpy);
        coreInstance.onLoadMocks(mocksLoadedSpy);
        coreInstance.onLoadFiles(filesLoadedSpy);
      }
      start(coreInstance) {
        startSpy(coreInstance);
      }
    }
  );

  testPlugin(
    "created as a Class with register method",
    class Plugin {
      register(coreInstance) {
        coreInstance.addCustomRouter("/foo-path", customRouter);
        registerSpy(coreInstance);
      }
      init(coreInstance) {
        initSpy(
          coreInstance,
          coreInstance.settings.get("behaviors"),
          coreInstance.settings.get("port"),
          coreInstance.settings.get("delay")
        );
        coreInstance.settings.set("log", "silly");
        coreInstance.onChangeSettings(changeSettingsSpy);
        coreInstance.onLoadMocks(mocksLoadedSpy);
        coreInstance.onLoadFiles(filesLoadedSpy);
      }
      start(coreInstance) {
        startSpy(coreInstance);
      }
    }
  );

  testAsyncPlugin(
    "created as a Class",
    class Plugin {
      register(coreInstance) {
        coreInstance.addCustomRouter("/foo-path", customRouter);
        registerSpy(coreInstance);
      }
      async init() {
        await wait(2000);
      }
      async start() {
        await wait(1000);
      }
    }
  );

  testPlugin("created as a function", (coreInstance) => {
    coreInstance.addCustomRouter("/foo-path", customRouter);
    registerSpy(coreInstance);
    return {
      init: (coreIns) => {
        initSpy(
          coreIns,
          coreIns.settings.get("behaviors"),
          coreIns.settings.get("port"),
          coreIns.settings.get("delay")
        );
        coreIns.settings.set("log", "silly");
        coreIns.onChangeSettings(changeSettingsSpy);
        coreIns.onLoadMocks(mocksLoadedSpy);
        coreIns.onLoadFiles(filesLoadedSpy);
      },
      start: (coreIns) => {
        startSpy(coreIns);
      },
    };
  });

  testAsyncPlugin("created as a function", (coreInstance) => {
    coreInstance.addCustomRouter("/foo-path", customRouter);
    registerSpy(coreInstance);
    return {
      init: async () => {
        await wait(2000);
      },
      start: async () => {
        await wait(1000);
      },
    };
  });

  testPlugin("created as a function returning register property", () => {
    return {
      register: (coreInstance) => {
        coreInstance.addCustomRouter("/foo-path", customRouter);
        registerSpy(coreInstance);
      },
      init: (coreInstance) => {
        initSpy(
          coreInstance,
          coreInstance.settings.get("behaviors"),
          coreInstance.settings.get("port"),
          coreInstance.settings.get("delay")
        );
        coreInstance.settings.set("log", "silly");
        coreInstance.onChangeSettings(changeSettingsSpy);
        coreInstance.onLoadMocks(mocksLoadedSpy);
        coreInstance.onLoadFiles(filesLoadedSpy);
      },
      start: (coreInstance) => {
        startSpy(coreInstance);
      },
    };
  });
});
