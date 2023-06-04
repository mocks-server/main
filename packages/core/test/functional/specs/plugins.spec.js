/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");

const filterPluginAlerts = (alerts) => alerts.filter((alert) => alert.id.indexOf("plugins") === 0);

const filterLogs = (logs, text) => logs.filter((log) => log.includes(text));

const {
  startCore,
  doFetch,
  fixturesFolder,
  wait,
  TimeCounter,
  removeConfigFile,
} = require("../support/helpers");

describe("plugins", () => {
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
  let propertiesSpy;
  let coreStartMethod;
  let coreStopMethod;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    mocksLoadedSpy = sandbox.spy();
    changeAlertsSpy = sandbox.spy();
    initSpy = sandbox.spy();
    registerSpy = sandbox.spy();
    configSpy = sandbox.spy();
    propertiesSpy = sandbox.spy();
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
          log: "info",
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

        it("should have received  core files", async () => {
          expect(propertiesSpy.getCall(0).args[0]).toBe(core.files);
        });

        it("should have received  core version", async () => {
          expect(propertiesSpy.getCall(0).args[1]).toEqual(core.version);
        });

        it("should have received  core variantHandlers", async () => {
          expect(propertiesSpy.getCall(0).args[2]).toBe(core.variantHandlers);
        });

        it("should have executed register method", async () => {
          expect(registerSpy.callCount).toEqual(1);
        });

        it("should have executed logger in register method", () => {
          expect(
            filterLogs(core.logger.globalStore, "[plugins:test-plugin] Log from register method")
              .length
          ).toEqual(1);
        });

        it("should have executed init method", async () => {
          expect(initSpy.callCount).toEqual(1);
        });

        it("should have executed logger in init method", () => {
          expect(
            filterLogs(core.logger.globalStore, "[plugins:test-plugin] Log from init method")
              .length
          ).toEqual(1);
        });

        it("should have config available when init is called", async () => {
          expect(initSpy.getCall(0).args[0]).toEqual(fixturesFolder("web-tutorial"));
          expect(initSpy.getCall(0).args[1]).toEqual(3100);
          expect(initSpy.getCall(0).args[2]).toEqual(0);
        });

        it("should have executed start method", async () => {
          expect(startSpy.callCount).toEqual(1);
        });

        it("should have executed logger in start method", () => {
          expect(
            filterLogs(core.logger.globalStore, "[plugins:test-plugin] Log from start method")
              .length
          ).toEqual(1);
        });

        it("should respond to custom routes", async () => {
          const response = await doFetch("/foo-path");

          expect(response.body).toEqual(FOO_CUSTOM_RESPONSE);
        });

        if (pluginConstructor.id) {
          it("should have added two plugin alerts", async () => {
            const alerts = filterPluginAlerts(core.alerts.flat);
            const registerAlert = alerts.find(
              (alert) => alert.id === "plugins:test-plugin:test-register"
            );
            const startAlert = alerts.find(
              (alert) => alert.id === "plugins:test-plugin:test-start"
            );

            expect(alerts.length).toEqual(2);
            expect(registerAlert.message).toEqual("Warning registering plugin");
            expect(startAlert.message).toEqual("Warning starting plugin");
          });
        } else {
          it("should have added three plugin alerts", async () => {
            const alerts = filterPluginAlerts(core.alerts.flat);
            const registerAlert = alerts.find(
              (alert) => alert.id === "plugins:test-plugin:test-register"
            );
            const startAlert = alerts.find(
              (alert) => alert.id === "plugins:test-plugin:test-start"
            );
            const idAlert = alerts.find((alert) => alert.id === "plugins:format:0");

            expect(alerts.length).toEqual(3);
            expect(registerAlert.message).toEqual("Warning registering plugin");
            expect(idAlert.message).toEqual("Plugins must have a static id property");
            expect(startAlert.message).toEqual("Warning starting plugin");
          });
        }
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

        if (pluginConstructor.id) {
          it("should have removed all alerts", async () => {
            expect(filterPluginAlerts(core.alerts.flat)).toEqual([]);
          });
        } else {
          it("should have removed two alerts", async () => {
            expect(filterPluginAlerts(core.alerts.flat).length).toEqual(1);
          });
        }

        it("should have executed logger in stop method", () => {
          expect(
            filterLogs(core.logger.globalStore, "[plugins:test-plugin] Log from stop method")
              .length
          ).toEqual(1);
        });
      });

      describe("when using the start method received in the scoped core", () => {
        it("should start server and send responses", async () => {
          await coreStartMethod();
          const users = await doFetch("/api/users");

          expect(users.body).toEqual([
            { id: 1, name: "John Doe modified" },
            { id: 2, name: "Jane Doe modified" },
          ]);
        });
      });

      describe("when using the stop method received in the scoped core", () => {
        it("should have executed logger in stop method", async () => {
          await coreStopMethod();

          expect(
            filterLogs(core.logger.globalStore, "[plugins:test-plugin] Log from stop method")
              .length
          ).toEqual(2);
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

        it("should have added two alerts", async () => {
          expect(filterPluginAlerts(core.alerts.flat)).toEqual([
            {
              // Plugin id is still not available in register method
              // It should have been renamed when start alert is received using a different context
              id: "plugins:test-plugin:test-register",
              message: "Warning registering plugin",
              error: undefined,
            },
            {
              id: "plugins:test-plugin:test-start",
              message: "Warning starting plugin",
              error: undefined,
            },
          ]);
        });
      });
    });
  };

  testPlugin(
    "created as a Class",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      constructor({
        start,
        stop,
        server,
        alerts,
        config,
        logger,
        files,
        version,
        variantHandlers,
        mock,
      }) {
        coreStartMethod = start;
        coreStopMethod = stop;
        this._logger = logger;
        this._alerts = alerts;
        this._config = config;
        this._mock = mock;
        logger.info("Log from register method");
        server.addRouter("/foo-path", customRouter);
        alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(config);
        propertiesSpy(files, version, variantHandlers);
      }
      init() {
        this._logger.info("Log from init method");
        initSpy(
          this._config.root.namespace("files").option("path").value,
          this._config.root.namespace("server").option("port").value,
          this._config.root.namespace("mock").namespace("routes").option("delay").value
        );
        this._config.root.option("log").value = "silly";
        this._alerts.onChange(changeAlertsSpy);
        this._mock.onChange(mocksLoadedSpy);
      }
      start() {
        this._logger.info("Log from start method");
        this._alerts.set("test-start", "Warning starting plugin");
        startSpy();
      }
      stop() {
        this._logger.info("Log from stop method");
        this._alerts.clean();
      }
    }
  );

  testPlugin(
    "created as a Class with register method",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      constructor({
        start,
        stop,
        server,
        alerts,
        config,
        logger,
        files,
        version,
        variantHandlers,
        mock,
      }) {
        coreStartMethod = start;
        coreStopMethod = stop;
        this._server = server;
        this._files = files;
        this._version = version;
        this._variantHandlers = variantHandlers;
        this._logger = logger;
        this._alerts = alerts;
        this._config = config;
        this._mock = mock;
      }

      register() {
        this._logger.info("Log from register method");
        this._server.addRouter("/foo-path", customRouter);
        this._alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(this._config);
        propertiesSpy(this._files, this._version, this._variantHandlers);
      }
      init() {
        this._logger.info("Log from init method");
        initSpy(
          this._config.root.namespace("files").option("path").value,
          this._config.root.namespace("server").option("port").value,
          this._config.root.namespace("mock").namespace("routes").option("delay").value
        );
        this._config.root.option("log").value = "silly";
        this._alerts.onChange(changeAlertsSpy);
        this._mock.onChange(mocksLoadedSpy);
      }
      start() {
        this._logger.info("Log from start method");
        this._alerts.set("test-start", "Warning starting plugin");
        startSpy();
      }
      stop() {
        this._logger.info("Log from stop method");
        this._alerts.clean();
      }
    }
  );

  testAsyncPlugin(
    "created as a Class",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      constructor({
        start,
        stop,
        server,
        alerts,
        config,
        logger,
        files,
        version,
        variantHandlers,
        mock,
      }) {
        coreStartMethod = start;
        coreStopMethod = stop;
        this._server = server;
        this._files = files;
        this._version = version;
        this._variantHandlers = variantHandlers;
        this._logger = logger;
        this._alerts = alerts;
        this._config = config;
        this._mock = mock;
      }

      register() {
        this._server.addRouter("/foo-path", customRouter);
        this._alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(this._config);
        propertiesSpy(this._files, this._version, this._variantHandlers);
      }
      async init() {
        await wait(2000);
      }
      async start() {
        this._alerts.set("test-start", "Warning starting plugin");
        await wait(1000);
      }
    }
  );
});
