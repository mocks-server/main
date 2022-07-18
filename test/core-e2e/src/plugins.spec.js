/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");

const filterPluginAlerts = (alerts) =>
  alerts.filter((alert) => alert.context.indexOf("plugins") === 0);

const filterLogs = (logs, text) => logs.filter((log) => log.includes(text));

const {
  startCore,
  doFetch,
  fixturesFolder,
  wait,
  TimeCounter,
  removeConfigFile,
} = require("./support/helpers");

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

        it("should have executed register method", async () => {
          expect(registerSpy.callCount).toEqual(1);
        });

        it("should have executed logger in register method", () => {
          expect(
            filterLogs(core.logs, "[plugins:test-plugin] Log from register method").length
          ).toEqual(1);
        });

        it("should have executed init method", async () => {
          expect(initSpy.callCount).toEqual(1);
        });

        it("should have executed logger in init method", () => {
          expect(
            filterLogs(core.logs, "[plugins:test-plugin] Log from init method").length
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
            filterLogs(core.logs, "[plugins:test-plugin] Log from start method").length
          ).toEqual(1);
        });

        it("should respond to custom routes", async () => {
          const response = await doFetch("/foo-path");
          expect(response.body).toEqual(FOO_CUSTOM_RESPONSE);
        });

        it("should have added two plugin alerts", async () => {
          const alerts = filterPluginAlerts(core.alerts);
          const registerAlert = alerts.find(
            (alert) => alert.context === "plugins:test-plugin:test-register"
          );
          const startAlert = alerts.find(
            (alert) => alert.context === "plugins:test-plugin:test-start"
          );
          expect(alerts.length).toEqual(2);
          expect(registerAlert.message).toEqual("Warning registering plugin");
          expect(startAlert.message).toEqual("Warning starting plugin");
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

        it("should have removed all alerts", async () => {
          expect(filterPluginAlerts(core.alerts)).toEqual([]);
        });

        it("should have executed logger in stop method", () => {
          expect(
            filterLogs(core.logs, "[plugins:test-plugin] Log from stop method").length
          ).toEqual(1);
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

      constructor({ server, alerts, config, logger }) {
        logger.info("Log from register method");
        server.addRouter("/foo-path", customRouter);
        alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(config);
      }
      init({ alerts, mock, logger, config }) {
        logger.info("Log from init method");
        initSpy(
          config.root.namespace("files").option("path").value,
          config.root.namespace("server").option("port").value,
          config.root.namespace("mock").namespace("routes").option("delay").value
        );
        config.root.option("log").value = "silly";
        alerts.onChange(changeAlertsSpy);
        mock.onChange(mocksLoadedSpy);
      }
      start({ alerts, logger }) {
        logger.info("Log from start method");
        alerts.set("test-start", "Warning starting plugin");
        startSpy();
      }
      stop({ alerts, logger }) {
        logger.info("Log from stop method");
        alerts.clean();
      }
    }
  );

  testPlugin(
    "created as a Class with register method",
    class Plugin {
      static get id() {
        return "test-plugin";
      }

      register({ server, alerts, config, logger }) {
        logger.info("Log from register method");
        server.addRouter("/foo-path", customRouter);
        alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(config);
      }
      init({ logger, config, alerts, mock }) {
        logger.info("Log from init method");
        initSpy(
          config.root.namespace("files").option("path").value,
          config.root.namespace("server").option("port").value,
          config.root.namespace("mock").namespace("routes").option("delay").value
        );
        config.root.option("log").value = "silly";
        alerts.onChange(changeAlertsSpy);
        mock.onChange(mocksLoadedSpy);
      }
      start({ alerts, logger }) {
        logger.info("Log from start method");
        alerts.set("test-start", "Warning starting plugin");
        startSpy();
      }
      stop({ alerts, logger }) {
        logger.info("Log from stop method");
        alerts.clean();
      }
    }
  );

  testPlugin(
    "created as a Class with register method and without static id",
    class Plugin {
      register({ server, alerts, config, logger }) {
        logger.info("Log from register method");
        server.addRouter("/foo-path", customRouter);
        alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(config);
      }
      init({ logger, config, alerts, mock }) {
        logger.info("Log from init method");
        initSpy(
          config.root.namespace("files").option("path").value,
          config.root.namespace("server").option("port").value,
          config.root.namespace("mock").namespace("routes").option("delay").value
        );
        config.root.option("log").value = "silly";
        alerts.onChange(changeAlertsSpy);
        mock.onChange(mocksLoadedSpy);
      }
      start({ alerts, logger }) {
        logger.info("Log from start method");
        alerts.set("test-start", "Warning starting plugin");
        startSpy();
      }
      stop({ alerts, logger }) {
        logger.info("Log from stop method");
        alerts.clean();
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

      register({ server, alerts, config }) {
        server.addRouter("/foo-path", customRouter);
        alerts.set("test-register", "Warning registering plugin");
        registerSpy();
        configSpy(config);
      }
      async init() {
        await wait(2000);
      }
      async start({ alerts }) {
        alerts.set("test-start", "Warning starting plugin");
        await wait(1000);
      }
    }
  );
});
