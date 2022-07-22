/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { Logger } = require("@mocks-server/logger");

const CoreMocks = require("../Core.mocks.js");
const ConfigMocks = require("../common/Config.mocks.js");
const LibsMocks = require("../common/Libs.mocks");

const Plugins = require("../../src/plugins/Plugins");
const Alerts = require("../../src/alerts/Alerts");

const NATIVE_PLUGINS_QUANTITY = 0;

const pluginsTrace = (method, quantity) => {
  return `${method}ed ${quantity} plugins without errors`;
};

const addNativePlugins = (quantity) => {
  return quantity + NATIVE_PLUGINS_QUANTITY;
};

const pluginsTraceAddingNative = (method, quantity) => {
  return pluginsTrace(method, addNativePlugins(quantity));
};

describe("Plugins", () => {
  let callbacks;
  let sandbox;
  let coreMocks;
  let coreInstance;
  let plugins;
  let configMocks;
  let configInstance;
  let libsMocks;
  let loadMocks;
  let loadRoutes;
  let pluginsOption;
  let alerts;
  let logger;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    loadMocks = sandbox.stub();
    loadRoutes = sandbox.stub();
    sandbox.stub(Logger.prototype, "verbose");
    sandbox.stub(Logger.prototype, "debug");
    sandbox.stub(Logger.prototype, "error");
    sandbox.stub(Logger.prototype, "warn");
    logger = new Logger();

    sandbox.spy(console, "log");
    coreMocks = new CoreMocks();
    configMocks = new ConfigMocks();
    libsMocks = new LibsMocks();
    coreInstance = coreMocks.stubs.instance;
    configInstance = configMocks.stubs.instance;
    libsMocks.stubs.fsExtra.existsSync.returns(true);
    pluginsOption = { value: [] };
    alerts = new Alerts("plugins", { logger });
    callbacks = {
      config: configInstance,
      alerts,
      logger,
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
      renameAlerts: sandbox.stub(),
      createCollectionsLoader: sandbox.stub().returns(loadMocks),
      createRoutesLoader: sandbox.stub().returns(loadRoutes),
    };
    plugins = new Plugins(callbacks, coreInstance);
    plugins._pluginsToRegister = pluginsOption;
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
    configMocks.restore();
    configInstance.coreOptions = {};
    libsMocks.restore();
  });

  describe("id", () => {
    it("should return plugins", async () => {
      expect(Plugins.id).toEqual("plugins");
    });
  });

  describe("register method", () => {
    const METHOD = "Register";
    it("should do nothing if there are no plugins to register", async () => {
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register object plugins", async () => {
      pluginsOption.value = [{}];
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register object plugins with register method", async () => {
      pluginsOption.value = [
        {
          register: () => {
            // do nothing
          },
        },
      ];
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register object plugins with register method passing to them the core itself", async () => {
      const fooPlugin = {
        register: sinon.spy(),
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(fooPlugin.register.getCall(0).args[0].core).toEqual(coreInstance);
    });

    it("should register object plugins with register method passing to them custom methods", async () => {
      const fooPlugin = {
        id: "foo-id",
        register: (methods) => {
          methods.loadRoutes();
          methods.loadMocks();
          methods.addAlert("foo", "Foo message");
          methods.removeAlerts();
          methods.logger.debug("foo log message");
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(loadMocks.callCount).toEqual(1);
      expect(loadRoutes.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith("foo-id:foo", "Foo message")).toEqual(true);
      expect(callbacks.removeAlerts.calledWith("foo-id")).toEqual(true);
      expect(callbacks.logger.debug.calledWith("foo log message")).toEqual(true);
    });

    it("should not have alerts available if object has no id", async () => {
      let pluginAlerts;
      const fooPlugin = {
        register: (methods) => {
          pluginAlerts = methods.alerts;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(pluginAlerts).toBe(undefined);
    });

    it("should have core mocks available", async () => {
      let pluginObject;
      const fooPlugin = {
        register: ({ mocks }) => {
          pluginObject = mocks;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(pluginObject).toBe(coreInstance.mocks);
    });

    it("should have core tracer available", async () => {
      let pluginObject;
      const fooPlugin = {
        register: ({ tracer }) => {
          pluginObject = tracer;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(pluginObject).toBe(coreInstance.tracer);
    });

    it("should have core logs available", async () => {
      let pluginObject;
      const fooPlugin = {
        register: ({ logs }) => {
          pluginObject = logs;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(pluginObject).toBe(coreInstance.logs);
    });

    it("should have core start method available", async () => {
      const fooPlugin = {
        register: ({ start }) => {
          start();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.start.callCount).toEqual(1);
    });

    it("should have core stop method available", async () => {
      const fooPlugin = {
        register: ({ stop }) => {
          stop();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.stop.callCount).toEqual(1);
    });

    it("should have core addRoutesHandler method available", async () => {
      const fooPlugin = {
        register: ({ addRoutesHandler }) => {
          addRoutesHandler();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.addRoutesHandler.callCount).toEqual(1);
    });

    it("should have core onChangeMocks method available", async () => {
      const fooPlugin = {
        register: ({ onChangeMocks }) => {
          onChangeMocks();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.onChangeMocks.callCount).toEqual(1);
    });

    it("should have core onChangeAlerts method available", async () => {
      const fooPlugin = {
        register: ({ onChangeAlerts }) => {
          onChangeAlerts();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.onChangeAlerts.callCount).toEqual(1);
    });

    it("should have core onChangeLogs method available", async () => {
      const fooPlugin = {
        register: ({ onChangeLogs }) => {
          onChangeLogs();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.onChangeLogs.callCount).toEqual(1);
    });

    it("should have core restartServer method available", async () => {
      const fooPlugin = {
        register: ({ restartServer }) => {
          restartServer();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.restartServer.callCount).toEqual(1);
    });

    it("should have core.server available", async () => {
      const fooPlugin = {
        register: ({ server }) => {
          server.restart();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.server.restart.callCount).toEqual(1);
    });

    it("should have core.mock available", async () => {
      const fooPlugin = {
        register: ({ mock }) => {
          mock.onChange();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.mock.onChange.callCount).toEqual(1);
    });

    it("should have core.variantHandlers available", async () => {
      const fooPlugin = {
        register: ({ variantHandlers }) => {
          variantHandlers.register();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.variantHandlers.register.callCount).toEqual(1);
    });

    it("should have core.version available", async () => {
      let version;
      const fooPlugin = {
        register: ({ version: coreVersion }) => {
          version = coreVersion;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(version).toEqual("foo-version");
    });

    it("should have core addRouter method available", async () => {
      const fooPlugin = {
        register: ({ addRouter }) => {
          addRouter();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.addRouter.callCount).toEqual(1);
    });

    it("should have core removeRouter method available", async () => {
      const fooPlugin = {
        register: ({ removeRouter }) => {
          removeRouter();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(coreInstance.removeRouter.callCount).toEqual(1);
    });

    it("should not have logs available if object has no id", async () => {
      let pluginLogger;
      const fooPlugin = {
        register: (methods) => {
          pluginLogger = methods.logger;
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(pluginLogger).toBe(undefined);
    });

    it("should not have alerts available if Class has no id", async () => {
      let pluginAlerts;
      class FooPlugin {
        register(methods) {
          pluginAlerts = methods.alerts;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(pluginAlerts).toBe(undefined);
    });

    it("should add an alert if plugin is an object", async () => {
      const fooPlugin = {
        id: "foo-plugin",
        register: (methods) => {
          methods.alerts.set("foo-id", "Foo message");
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(alerts.flat[0].collection).toEqual("plugins:format");
      expect(alerts.flat[0].value.message).toEqual(
        expect.stringContaining("Defining Plugins as objects is deprecated")
      );
      expect(alerts.flat[0].id).toEqual("foo-plugin");
    });

    it("should have alerts available if object has id", async () => {
      const fooPlugin = {
        id: "foo-plugin",
        register: (methods) => {
          methods.alerts.set("foo-id", "Foo message");
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(alerts.flat[1].collection).toEqual("plugins:foo-plugin");
      expect(alerts.flat[1].value.message).toEqual("Foo message");
      expect(alerts.flat[1].id).toEqual("foo-id");
    });

    it("should have alerts available if Class has id", async () => {
      class FooPlugin {
        static get id() {
          return "foo-plugin";
        }

        register(methods) {
          methods.alerts.set("foo-id", "Foo message");
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(alerts.flat[0].collection).toEqual("plugins:foo-plugin");
      expect(alerts.flat[0].value.message).toEqual("Foo message");
      expect(alerts.flat[0].id).toEqual("foo-id");
    });

    it("should have alerts available if Class has id getter", async () => {
      class FooPlugin {
        get id() {
          return "foo-plugin";
        }

        register(methods) {
          methods.alerts.set("foo-id", "Foo message");
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(alerts.flat[0].collection).toEqual("plugins:foo-plugin");
      expect(alerts.flat[0].value.message).toEqual("Foo message");
      expect(alerts.flat[0].id).toEqual("foo-id");
    });

    it("should not register object plugins with register method throwing an error", async () => {
      const fooPlugin = {
        register: () => {
          throw new Error();
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should not register strings as plugins", async () => {
      pluginsOption.value = ["foo"];
      await plugins.register();
      expect(alerts.flat[0].value.message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].collection).toEqual("plugins:register");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should not register booleans as plugins", async () => {
      pluginsOption.value = [true];
      await plugins.register();
      expect(alerts.flat[0].value.message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].collection).toEqual("plugins:register");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register function plugins executing them passing the core", async () => {
      let receivedCore;
      const fooPlugin = ({ core }) => {
        receivedCore = core;
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should add an alert if plugin is a function", async () => {
      const fooPlugin = () => {
        return {
          id: "foo-plugin",
        };
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(alerts.flat[0].collection).toEqual("plugins:format");
      expect(alerts.flat[0].value.message).toEqual(
        expect.stringContaining("Defining Plugins as functions is deprecated")
      );
      expect(alerts.flat[0].id).toEqual("foo-plugin");
    });

    it("should register function plugins executing them passing custom methods", async () => {
      expect.assertions(4);
      const fooPlugin = (methods) => {
        methods.loadMocks();
        methods.loadRoutes();
        methods.addAlert("foo", "Foo message");
        methods.removeAlerts();
        return {};
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(loadMocks.callCount).toEqual(1);
      expect(loadRoutes.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`${addNativePlugins(0)}:foo`, "Foo message")).toEqual(
        true
      );
      expect(callbacks.removeAlerts.calledWith(`${addNativePlugins(0)}`)).toEqual(true);
    });

    it("should register function plugins returning a register method", async () => {
      expect.assertions(3);
      const spy = sinon.spy();
      const fooPlugin = () => ({
        register: spy,
      });
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(spy.getCall(0).args[0].core).toEqual(coreInstance);
      expect(spy.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register function plugins with the function id property", async () => {
      const spy = sinon.spy();
      const fooPlugin = () => ({
        register: spy,
      });
      fooPlugin.id = "fooPlugin";
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(configMocks.stubs.instance.addNamespace.calledWith("fooPlugin")).toEqual(true);
    });

    it("should register function plugins with the returned id", async () => {
      const spy = sinon.spy();
      pluginsOption.value = [
        () => ({
          register: spy,
          id: "foo-plugin",
        }),
      ];
      await plugins.register();
      expect(configMocks.stubs.instance.addNamespace.calledWith("foo-plugin")).toEqual(true);
    });

    it("should not register function plugins returning a register method which throws an error", async () => {
      const fooPlugin = () => ({
        register: () => {
          throw new Error();
        },
      });
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins, instantiating them passing the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor({ core }) {
          console.log("Created class");
          receivedCore = core;
          instantiated = true;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register class plugins, instantiating them passing custom methods", async () => {
      expect.assertions(4);
      class FooPlugin {
        constructor(methods) {
          methods.loadMocks();
          methods.loadRoutes();
          methods.addAlert("foo", "Foo message");
          methods.removeAlerts();
          return {};
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(loadMocks.callCount).toEqual(1);
      expect(loadRoutes.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`${addNativePlugins(0)}:foo`, "Foo message")).toEqual(
        true
      );
      expect(callbacks.removeAlerts.calledWith(`${addNativePlugins(0)}`)).toEqual(true);
    });

    it("should not register class plugins if class throw an error when being created", async () => {
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(alerts.flat[0].value.message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].collection).toEqual("plugins:register");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins with a register method, passing to it the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor() {
          console.log("Created class");
        }
        register({ core }) {
          receivedCore = core;
          instantiated = true;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should not register class plugins with a register method when it throws an error", async () => {
      expect.assertions(1);
      class FooPlugin {
        constructor() {
          console.log("Created class");
        }
        register() {
          throw new Error();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should trace the total number of registered plugins", async () => {
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      class FooPlugin2 {}
      pluginsOption.value = [
        FooPlugin,
        FooPlugin2,
        () => {
          // do nothing
        },
        true,
        false,
        "foo",
        { foo: "foo" },
      ];
      await plugins.register();
      expect(alerts.flat.length).toEqual(6);
      expect(alerts.flat[0].value.message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[1].value.message).toEqual("Error registering plugin '3'");
      expect(alerts.flat[2].value.message).toEqual("Error registering plugin '4'");
      expect(alerts.flat[3].value.message).toEqual("Error registering plugin '5'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 3))).toEqual(true);
    });
  });

  describe("init method", () => {
    const METHOD = "Initializat";
    it("should do nothing if there are no plugins to register", async () => {
      pluginsOption.value = [];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should init object plugins with an init property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        init: sinon.spy(),
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.init();
      expect(fooPlugin.init.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin id", async () => {
      const fooPlugin = {
        init: sinon.spy(),
        id: "foo-plugin",
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.init();
      expect(logger.debug.calledWith("Initializing plugin 'foo-plugin'")).toEqual(true);
    });

    it("should trace the plugin id when it is a static property in the class", async () => {
      class FooPlugin {
        static get id() {
          return "foo-plugin";
        }
        init() {
          sinon.spy();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.init();
      expect(plugins._pluginId(0)).toEqual("foo-plugin");
      expect(logger.debug.calledWith("Initializing plugin 'foo-plugin'")).toEqual(true);
    });

    it("should accept init methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => true,
      };
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method errors and notify alerts", async () => {
      const fooPlugin = {
        init: () => {
          throw new Error();
        },
      };
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        init: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(alerts.flat.length).toEqual(4);
      expect(alerts.flat[0].value.message).toEqual("Error initializating plugin '0'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => {
          return Promise.reject(new Error());
        },
      };
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        init: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no init method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        init: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should init plugins passing the core, config and custom methods", async () => {
      let receivedCore;
      let receivedConfig;
      const fooPlugin = () => {
        return {
          id: "foo-plugin",
          init: ({
            core,
            loadMocks: loadMocksOption,
            loadRoutes: loadRoutesOption,
            addAlert: addAlertOption,
            removeAlerts: removeAlertsOption,
            config,
          }) => {
            receivedCore = core;
            receivedConfig = config;
            loadMocksOption();
            loadRoutesOption();
            addAlertOption("foo", "Foo message");
            removeAlertsOption();
          },
        };
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.init();
      expect(receivedCore).toEqual(coreInstance);
      expect(receivedConfig).toEqual(configMocks.stubs.namespace);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
      expect(loadMocks.callCount).toEqual(1);
      expect(loadRoutes.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`foo-plugin:foo`, "Foo message")).toEqual(true);
      expect(callbacks.removeAlerts.calledWith(`foo-plugin`)).toEqual(true);
    });

    it("should not pass the config object if plugin has not id", async () => {
      let receivedConfig;
      const fooPlugin = () => {
        return {
          init: ({ config }) => {
            receivedConfig = config;
          },
        };
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.init();
      expect(receivedConfig).toEqual(undefined);
    });
  });

  describe("start method", () => {
    const METHOD = "Start";

    it("should do nothing if there are no plugins to register", async () => {
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should start object plugins with an start property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        start: sinon.spy(),
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.start();
      expect(fooPlugin.start.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin id", async () => {
      const fooPlugin = {
        start: sinon.spy(),
        id: "foo-plugin",
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.start();
      expect(logger.debug.calledWith("Starting plugin 'foo-plugin'")).toEqual(true);
    });

    it("should accept start methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => true,
      };
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method errors and notify alert", async () => {
      const fooPlugin = {
        start: () => {
          throw new Error();
        },
      };
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        start: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(alerts.flat.length).toEqual(4);
      expect(alerts.flat[0].value.message).toEqual("Error starting plugin '0'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => {
          return Promise.reject(new Error());
        },
      };
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        start: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no start method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        start: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should start plugins passing the core, config and custom methods", async () => {
      let receivedCore;
      let receivedConfig;
      const fooPlugin = () => {
        return {
          id: "foo-plugin",
          start: ({
            core,
            loadMocks: loadMocksOption,
            loadRoutes: loadRoutesOption,
            addAlert: addAlertOption,
            removeAlerts: removeAlertsOption,
            config,
          }) => {
            receivedCore = core;
            receivedConfig = config;
            loadMocksOption();
            loadRoutesOption();
            addAlertOption("foo", "Foo message");
            removeAlertsOption();
          },
        };
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.start();
      expect(receivedCore).toEqual(coreInstance);
      expect(receivedConfig).toEqual(configMocks.stubs.namespace);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
      expect(loadMocks.callCount).toEqual(1);
      expect(loadRoutes.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`foo-plugin:foo`, "Foo message")).toEqual(true);
      expect(callbacks.removeAlerts.calledWith(`foo-plugin`)).toEqual(true);
    });
  });

  describe("stop method", () => {
    const METHOD = "Stopp";

    it("should do nothing if there are no plugins to stop", async () => {
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should stop object plugins with an stop property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        stop: sinon.spy(),
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.stop();
      expect(fooPlugin.stop.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin id", async () => {
      const fooPlugin = {
        stop: sinon.spy(),
        id: "foo-plugin",
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      await plugins.stop();
      expect(logger.debug.calledWith("Stopping plugin 'foo-plugin'")).toEqual(true);
    });

    it("should accept stop methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => true,
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch stop method errors and notify alert", async () => {
      expect.assertions(3);
      const fooPlugin = {
        stop: () => {
          throw new Error();
        },
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(alerts.flat.length).toEqual(4);
      expect(alerts.flat[0].value.message).toEqual("Error stopping plugin '0'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch stop method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => {
          return Promise.reject(new Error());
        },
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no stop method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve(),
      };
      pluginsOption.value = [fooPlugin, fooPlugin2, fooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });
  });

  describe("alerts", () => {
    let fooPlugin;
    beforeEach(() => {
      fooPlugin = {
        register: ({ addAlert }) => {
          addAlert("test-register", "Testing register alert");
        },
        start: ({ addAlert }) => {
          addAlert("test-start", "Testing start alert");
        },
        id: "foo-name",
      };
    });

    it("should have as scope the plugin id during the register method", async () => {
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      expect(
        callbacks.addAlert.calledWith("foo-name:test-register", "Testing register alert")
      ).toEqual(true);
    });

    it("should rename the scope if the id is added afterwards", async () => {
      expect.assertions(2);
      fooPlugin = {
        register: ({ addAlert }) => {
          addAlert("test-register", "Testing register alert");
        },
        start: ({ addAlert }) => {
          addAlert("test-start", "Testing start alert");
        },
      };
      pluginsOption.value = [fooPlugin];
      await plugins.register();
      fooPlugin.id = "foo-name";
      await plugins.start();
      expect(callbacks.renameAlerts.calledWith("0:", "foo-name:")).toEqual(true);
      expect(callbacks.addAlert.calledWith("foo-name:test-start", "Testing start alert")).toEqual(
        true
      );
    });
  });
});
