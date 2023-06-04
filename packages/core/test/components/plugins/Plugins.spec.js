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

const { Plugins } = require("../../../src/plugins/Plugins");
const { Alerts } = require("../../../src/alerts/Alerts");

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
      expect(alerts.flat[0].id).toEqual("plugins:foo-plugin:foo-id");
      expect(alerts.flat[0].message).toEqual("Foo message");
    });

    it("should have alerts available if Class has id getter, and should have added alert about format", async () => {
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
      expect(alerts.flat[0].id).toEqual("plugins:format:0");
      expect(alerts.flat[1].id).toEqual("plugins:foo-plugin:foo-id");
      expect(alerts.flat[1].message).toEqual("Foo message");
    });

    it("should not register strings as plugins", async () => {
      pluginsOption.value = ["foo"];
      await plugins.register();
      expect(alerts.flat[0].message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].id).toEqual("plugins:register:0");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should not register booleans as plugins", async () => {
      pluginsOption.value = [true];
      await plugins.register();
      expect(alerts.flat[0].message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].id).toEqual("plugins:register:0");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins, instantiating them passing the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor(core) {
          receivedCore = core;
          instantiated = true;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(receivedCore.server).toEqual(coreInstance.server);
      expect(instantiated).toEqual(true);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should not register class plugins if class throw an error when being created", async () => {
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(alerts.flat[0].message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[0].id).toEqual("plugins:register:0");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins with a register method, passing to it the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor() {
          // do nothing
        }
        register(core) {
          receivedCore = core;
          instantiated = true;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      expect(receivedCore.server).toEqual(coreInstance.server);
      expect(instantiated).toEqual(true);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should not register class plugins with a register method when it throws an error", async () => {
      expect.assertions(1);
      class FooPlugin {
        constructor() {
          // do nothing
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
      expect(alerts.flat.length).toEqual(13);
      expect(alerts.flat[0].message).toEqual("Error registering plugin '0'");
      expect(alerts.flat[1].message).toEqual("Error registering plugin '2'");
      expect(alerts.flat[2].message).toEqual("Error registering plugin '3'");
      expect(alerts.flat[3].message).toEqual("Error registering plugin '4'");
      expect(alerts.flat[4].message).toEqual("Error registering plugin '5'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });
  });

  describe("init method", () => {
    const METHOD = "Initializ";
    it("should do nothing if there are no plugins to register", async () => {
      pluginsOption.value = [];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
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
      class FooPlugin {
        init() {
          return true;
        }
      }
      class FooPlugin2 {
        init() {
          return Promise.resolve();
        }
      }

      pluginsOption.value = [FooPlugin, FooPlugin2];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method errors and notify alerts", async () => {
      class FooPlugin {
        init() {
          throw new Error();
        }
      }
      class FooPlugin2 {
        init() {
          return Promise.resolve();
        }
      }

      class FooPlugin3 {
        init() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(alerts.flat.length).toEqual(4);
      expect(alerts.flat[0].message).toEqual("Error initializing plugin '0'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method rejected", async () => {
      expect.assertions(1);
      class FooPlugin {
        init() {
          return Promise.reject(new Error());
        }
      }
      class FooPlugin2 {
        init() {
          return Promise.resolve();
        }
      }

      class FooPlugin3 {
        init() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no init method", async () => {
      expect.assertions(1);
      class FooPlugin {}
      class FooPlugin2 {
        init() {
          return Promise.resolve();
        }
      }

      class FooPlugin3 {
        init() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.init();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
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
      const spy = sinon.spy();
      class FooPlugin {
        static get id() {
          return "foo";
        }
        start() {
          spy();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.start();
      expect(spy.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin id", async () => {
      const spy = sinon.spy();
      class FooPlugin {
        static get id() {
          return "foo-plugin";
        }
        start() {
          spy();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.start();
      expect(logger.debug.calledWith("Starting plugin 'foo-plugin'")).toEqual(true);
    });

    it("should accept start methods non returning a Promise", async () => {
      expect.assertions(1);
      class FooPlugin {
        start() {
          return true;
        }
      }
      class FooPlugin2 {
        start() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method errors and notify alert", async () => {
      class FooPlugin {
        start() {
          throw new Error();
        }
      }
      class FooPlugin2 {
        start() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        start() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(alerts.flat.length).toEqual(4);
      expect(alerts.flat[0].message).toEqual("Error starting plugin '0'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method rejected", async () => {
      expect.assertions(1);
      class FooPlugin {
        start() {
          return Promise.reject(new Error());
        }
      }
      class FooPlugin2 {
        start() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        start() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no start method", async () => {
      expect.assertions(1);
      class FooPlugin {}
      class FooPlugin2 {
        start() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        start() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.start();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should start plugins passing core with custom config", async () => {
      let receivedConfig;
      class FooPlugin {
        static get id() {
          return "foo-plugin";
        }
        start({ config }) {
          receivedConfig = config;
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.start();
      expect(receivedConfig).toEqual(configMocks.stubs.namespace);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
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
      const spy = sinon.spy();
      class FooPlugin {
        static get id() {
          return "foo";
        }
        stop() {
          spy();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.stop();
      expect(spy.callCount).toEqual(1);
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin id", async () => {
      const spy = sinon.spy();
      class FooPlugin {
        static get id() {
          return "foo";
        }
        stop() {
          spy();
        }
      }
      pluginsOption.value = [FooPlugin];
      await plugins.register();
      await plugins.stop();
      expect(logger.debug.calledWith("Stopping plugin 'foo'")).toEqual(true);
    });

    it("should accept stop methods non returning a Promise", async () => {
      expect.assertions(1);
      class FooPlugin {
        static get id() {
          return "foo";
        }
        stop() {
          return true;
        }
      }
      class FooPlugin2 {
        static get id() {
          return "foo2";
        }
        stop() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch stop method errors and notify alert", async () => {
      expect.assertions(3);
      class FooPlugin {
        static get id() {
          return "foo";
        }
        stop() {
          throw new Error();
        }
      }
      class FooPlugin2 {
        static get id() {
          return "foo2";
        }
        stop() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        static get id() {
          return "foo3";
        }
        stop() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(alerts.flat.length).toEqual(1);
      expect(alerts.flat[0].message).toEqual("Error stopping plugin 'foo'");
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch stop method rejected", async () => {
      expect.assertions(1);
      class FooPlugin {
        static get id() {
          return "foo";
        }
        stop() {
          return Promise.reject(new Error());
        }
      }
      class FooPlugin2 {
        static get id() {
          return "foo2";
        }
        stop() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        static get id() {
          return "foo3";
        }
        stop() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no stop method", async () => {
      expect.assertions(1);
      class FooPlugin {
        static get id() {
          return "foo";
        }
      }
      class FooPlugin2 {
        static get id() {
          return "foo2";
        }
        stop() {
          return Promise.resolve();
        }
      }
      class FooPlugin3 {
        static get id() {
          return "foo3";
        }
        stop() {
          return Promise.resolve();
        }
      }
      pluginsOption.value = [FooPlugin, FooPlugin2, FooPlugin3];
      await plugins.register();
      await plugins.stop();
      expect(logger.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });
  });
});
