/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");

const filterPluginAlerts = (alerts) =>
  alerts.filter(
    (alert) =>
      alert.context.indexOf("plugins") === 0 && alert.context.indexOf("plugins:format") !== 0
  );

const {
  startCore,
  doFetch,
  fixturesFolder,
  wait,
  TimeCounter,
  removeConfigFile,
} = require("./support/helpers");

describe("plugins using legacy alerts", () => {
  const FOO_CUSTOM_RESPONSE = {
    foo: "foo",
  };
  let core;
  let customRouter;
  let sandbox;
  let changeAlertsSpy;
  let mocksLoadedSpy;
  let initSpy;
  let registerSpy;
  let configSpy;
  let startSpy;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    mocksLoadedSpy = sandbox.spy();
    changeAlertsSpy = sandbox.spy();
    initSpy = sandbox.spy();
    registerSpy = sandbox.spy();
    configSpy = sandbox.spy();
    startSpy = sandbox.spy();
    customRouter = express.Router();
    customRouter.get("/", (_req, res) => {
      res.status(200);
      res.send(FOO_CUSTOM_RESPONSE);
    });
  });

  afterAll(() => {
    removeConfigFile();
    sandbox.restore();
  });

  const testPlugin = (description, pluginConstructor, options = {}) => {
    describe(`${description}`, () => {
      beforeAll(async () => {
        core = await startCore("web-tutorial", {
          plugins: {
            register: [pluginConstructor],
          },
        });
      });

      afterAll(async () => {
        await core.stop();
        sandbox.reset();
      });

      describe("when started", () => {
        it("should start server and send responses", async () => {
          const users = await doFetch("/api/users");
          expect(users.body).toEqual([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
          ]);
        });

        if (!options.doNotTestConfig) {
          it("should have received config", async () => {
            expect(configSpy.getCall(0).args[0]).not.toBe(undefined);
          });
        }

        it("should have executed register method", async () => {
          expect(registerSpy.callCount).toEqual(1);
        });

        it("should have executed init method", async () => {
          expect(initSpy.callCount).toEqual(1);
        });

        it("should have passed core to init method", async () => {
          expect(initSpy.getCall(0).args[0]).toEqual(core);
        });

        it("should have config available when init is called", async () => {
          expect(initSpy.getCall(0).args[1]).toEqual(fixturesFolder("web-tutorial"));
          expect(initSpy.getCall(0).args[2]).toEqual(3100);
          expect(initSpy.getCall(0).args[3]).toEqual(0);
        });

        it("should have executed start method", async () => {
          expect(startSpy.callCount).toEqual(1);
        });

        it("should have passed core to start method", async () => {
          expect(startSpy.getCall(0).args[0]).toEqual(core);
        });

        it("should respond to custom routes", async () => {
          const response = await doFetch("/foo-path");
          expect(response.body).toEqual(FOO_CUSTOM_RESPONSE);
        });

        it("should have added three plugin alerts", async () => {
          const alerts = filterPluginAlerts(core.alerts);
          const registerAlert = alerts.find(
            (alert) => alert.context === "plugins:test-plugin:test-register"
          );
          const startAlert = alerts.find(
            (alert) => alert.context === "plugins:test-plugin:test-start"
          );
          const deprecatedCoreAlert = alerts.find(
            (alert) => alert.context === "plugins:test-plugin:deprecated:core"
          );
          expect(alerts.length).toEqual(3);
          expect(registerAlert.message).toEqual("Warning registering plugin");
          expect(startAlert.message).toEqual("Warning starting plugin");
          expect(deprecatedCoreAlert.message).toEqual(
            expect.stringContaining(
              "Usage of core property is deprecated. Use properties at first level instead"
            )
          );
        });

        it("should have added one deprecation alert", async () => {
          const alerts = core.alerts;
          const deprecationAlert = alerts.find((alert) => alert.context === "deprecated:addAlert");
          expect(deprecationAlert.message).toEqual(
            expect.stringContaining("Detected usage of deprecated method 'addAlert'")
          );
        });
      });

      describe("when emit events", () => {
        beforeAll(async () => {
          core.config.namespace("files").option("path").value =
            fixturesFolder("web-tutorial-modified");
          await wait(5000);
        });

        it("should inform plugin when mocks are loaded", async () => {
          expect(mocksLoadedSpy.callCount).toEqual(2);
        });
      });

      describe("when stopped", () => {
        beforeAll(async () => {
          await core.stop();
        });

        it("should have added deprecation alert", async () => {
          const alerts = core.alerts;
          const deprecationAlert = alerts.find(
            (alert) => alert.context === "deprecated:removeAlert"
          );
          expect(deprecationAlert.message).toEqual(
            expect.stringContaining("Detected usage of deprecated method 'removeAlerts'")
          );
        });

        it("should have not removed deprecation alerts", async () => {
          const alerts = core.alerts;
          const deprecationAlerts = alerts.filter((alert) =>
            alert.context.startsWith("deprecated")
          );
          expect(deprecationAlerts.length).toEqual(2);
        });

        it("should have removed all plugin alerts", async () => {
          expect(filterPluginAlerts(core.alerts)).toEqual([]);
        });
      });
    });
  };

  const testAsyncPlugin = (description, pluginConstructor, options = {}) => {
    describe(`${description} with async methods`, () => {
      afterAll(async () => {
        sandbox.reset();
        await core.stop();
      });

      describe("when started", () => {
        it("should start server when all initialization is finished", async () => {
          const timeCounter = new TimeCounter();
          core = await startCore("web-tutorial", {
            plugins: { register: [pluginConstructor] },
          });
          const users = await doFetch("/api/users");
          expect(users.body).toEqual([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
          ]);
          timeCounter.stop();
          expect(timeCounter.total).toBeGreaterThan(3000);
        });

        if (!options.doNotTestConfig) {
          it("should have received config", async () => {
            expect(configSpy.getCall(0).args[0]).not.toBe(undefined);
          });
        }

        it("should have added three alerts", async () => {
          expect(filterPluginAlerts(core.alerts)).toEqual([
            {
              // Plugin id is still not available in register method
              // It should have been renamed when start alert is received using a different context
              context: "plugins:test-plugin:test-register",
              message: "Warning registering plugin",
              error: undefined,
            },
            {
              context: "plugins:test-plugin:test-start",
              message: "Warning starting plugin",
              error: undefined,
            },
            {
              context: "plugins:test-plugin:deprecated:core",
              error: undefined,
              message:
                "Usage of core property is deprecated. Use properties at first level instead: https://www.mocks-server.org/docs/next/guides-migrating-from-v3#plugins",
            },
          ]);
        });
      });
    });
  };

  testPlugin("created as an object", {
    id: "test-plugin",
    register: ({ core: coreInstance, addAlert, config }) => {
      coreInstance.addRouter("/foo-path", customRouter);
      addAlert("test-register", "Warning registering plugin");
      registerSpy(coreInstance);
      configSpy(config);
    },
    init: ({ core: coreInstance }) => {
      initSpy(
        coreInstance,
        coreInstance.config.namespace("files").option("path").value,
        coreInstance.config.namespace("server").option("port").value,
        coreInstance.config.namespace("mocks").option("delay").value
      );
      coreInstance.config.option("log").value = "silly";
      coreInstance.onChangeAlerts(changeAlertsSpy);
      coreInstance.onChangeMocks(mocksLoadedSpy);
    },
    start: ({ core: coreInstance, addAlert }) => {
      startSpy(coreInstance);
      addAlert("test-start", "Warning starting plugin");
    },
    stop: ({ removeAlerts }) => {
      removeAlerts();
    },
  });

  testAsyncPlugin("created as an object", {
    // TODO, allow async register
    id: "test-plugin",
    register: ({ core: coreInstance, addAlert, config }) => {
      coreInstance.addRouter("/foo-path", customRouter);
      addAlert("test-register", "Warning registering plugin");
      configSpy(config);
    },
    init: () => {
      return wait(2000);
    },
    start: ({ addAlert }) => {
      addAlert("test-start", "Warning starting plugin");
      return wait(1000);
    },
  });

  testPlugin(
    "created as a Class",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      constructor({ core: coreInstance, addAlert, config }) {
        this._core = coreInstance;
        coreInstance.addRouter("/foo-path", customRouter);
        addAlert("test-register", "Warning registering plugin");
        registerSpy(coreInstance);
        configSpy(config);
      }
      init({ core: coreInstance }) {
        initSpy(
          coreInstance,
          coreInstance.config.namespace("files").option("path").value,
          coreInstance.config.namespace("server").option("port").value,
          coreInstance.config.namespace("mocks").option("delay").value
        );
        coreInstance.config.option("log").value = "silly";
        coreInstance.onChangeAlerts(changeAlertsSpy);
        coreInstance.onChangeMocks(mocksLoadedSpy);
      }
      start({ core: coreInstance, addAlert }) {
        addAlert("test-start", "Warning starting plugin");
        startSpy(coreInstance);
      }
      stop({ removeAlerts }) {
        removeAlerts();
      }
    }
  );

  testPlugin(
    "created as a Class with register method",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      register({ core: coreInstance, addAlert, config }) {
        coreInstance.addRouter("/foo-path", customRouter);
        addAlert("test-register", "Warning registering plugin");
        registerSpy(coreInstance);
        configSpy(config);
      }
      init({ core: coreInstance }) {
        initSpy(
          coreInstance,
          coreInstance.config.namespace("files").option("path").value,
          coreInstance.config.namespace("server").option("port").value,
          coreInstance.config.namespace("mocks").option("delay").value
        );
        coreInstance.config.option("log").value = "silly";
        coreInstance.onChangeAlerts(changeAlertsSpy);
        coreInstance.onChangeMocks(mocksLoadedSpy);
      }
      start({ core: coreInstance, addAlert }) {
        addAlert("test-start", "Warning starting plugin");
        startSpy(coreInstance);
      }
      stop({ removeAlerts }) {
        removeAlerts();
      }
    }
  );

  testPlugin(
    "created as a Class with register method and without static id",
    class Plugin {
      register({ core: coreInstance, addAlert, config }) {
        coreInstance.addRouter("/foo-path", customRouter);
        addAlert("test-register", "Warning registering plugin");
        registerSpy(coreInstance);
        configSpy(config);
      }
      init({ core: coreInstance }) {
        initSpy(
          coreInstance,
          coreInstance.config.namespace("files").option("path").value,
          coreInstance.config.namespace("server").option("port").value,
          coreInstance.config.namespace("mocks").option("delay").value
        );
        coreInstance.config.option("log").value = "silly";
        coreInstance.onChangeAlerts(changeAlertsSpy);
        coreInstance.onChangeMocks(mocksLoadedSpy);
      }
      start({ core: coreInstance, addAlert }) {
        addAlert("test-start", "Warning starting plugin");
        startSpy(coreInstance);
      }
      stop({ removeAlerts }) {
        removeAlerts();
      }
      get id() {
        return "test-plugin";
      }
    }
  );

  testAsyncPlugin(
    "created as a Class",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      register({ core: coreInstance, addAlert, config }) {
        coreInstance.addRouter("/foo-path", customRouter);
        addAlert("test-register", "Warning registering plugin");
        registerSpy(coreInstance);
        configSpy(config);
      }
      async init() {
        await wait(2000);
      }
      async start({ addAlert }) {
        addAlert("test-start", "Warning starting plugin");
        await wait(1000);
      }
    }
  );

  testPlugin("created as a function", ({ addAlert }) => {
    addAlert("test-register", "Warning registering plugin");
    return {
      id: "test-plugin",
      register({ core: coreInstance, config, addRouter }) {
        registerSpy(coreInstance);
        addRouter("/foo-path", customRouter);
        configSpy(config);
      },
      init: ({ core: coreIns }) => {
        initSpy(
          coreIns,
          coreIns.config.namespace("files").option("path").value,
          coreIns.config.namespace("server").option("port").value,
          coreIns.config.namespace("mocks").option("delay").value
        );
        coreIns.config.option("log").value = "silly";
        coreIns.onChangeAlerts(changeAlertsSpy);
        coreIns.onChangeMocks(mocksLoadedSpy);
      },
      start: ({ core: coreInstance, addAlert: addAlertHere }) => {
        addAlertHere("test-start", "Warning starting plugin");
        startSpy(coreInstance);
      },
      stop: ({ removeAlerts }) => {
        removeAlerts();
      },
    };
  });

  testAsyncPlugin(
    "created as a function",
    ({ core: coreInstance, addAlert }) => {
      addAlert("test-register", "Warning registering plugin");
      registerSpy(coreInstance);
      return {
        id: "test-plugin",
        register: ({ core: coreRegisterInstance }) => {
          coreRegisterInstance.addRouter("/foo-path", customRouter);
        },
        init: async () => {
          await wait(2000);
        },
        start: async () => {
          addAlert("test-start", "Warning starting plugin");
          await wait(1000);
        },
      };
    },
    { doNotTestConfig: true }
  );

  testPlugin("created as a function returning register property", () => {
    return {
      id: "test-plugin",
      register: ({ core: coreInstance, addAlert, config }) => {
        coreInstance.addRouter("/foo-path", customRouter);
        addAlert("test-register", "Warning registering plugin");
        registerSpy(coreInstance);
        configSpy(config);
      },
      init: ({ core: coreInstance }) => {
        initSpy(
          coreInstance,
          coreInstance.config.namespace("files").option("path").value,
          coreInstance.config.namespace("server").option("port").value,
          coreInstance.config.namespace("mocks").option("delay").value
        );
        coreInstance.config.option("log").value = "silly";
        coreInstance.onChangeAlerts(changeAlertsSpy);
        coreInstance.onChangeMocks(mocksLoadedSpy);
      },
      start: ({ core: coreInstance, addAlert }) => {
        addAlert("test-start", "Warning starting plugin");
        startSpy(coreInstance);
      },
      stop: ({ removeAlerts }) => {
        removeAlerts();
      },
    };
  });
});