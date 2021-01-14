/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("../Core.mocks.js");
const LoadersMocks = require("../Loaders.mocks.js");
const ConfigMocks = require("../Config.mocks.js");
const LibsMocks = require("../Libs.mocks.js");

const Plugins = require("../../../src/plugins/Plugins");
const tracer = require("../../../src/tracer");

const NATIVE_PLUGINS_QUANTITY = 2;

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
  let loaderMocks;
  let plugins;
  let configMocks;
  let configInstance;
  let libsMocks;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    callbacks = {
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
      renameAlerts: sandbox.stub(),
    };
    sandbox.stub(tracer, "verbose");
    sandbox.stub(tracer, "debug");
    sandbox.stub(tracer, "error");
    sandbox.spy(console, "log");
    coreMocks = new CoreMocks();
    loaderMocks = new LoadersMocks();
    configMocks = new ConfigMocks();
    libsMocks = new LibsMocks();
    coreInstance = coreMocks.stubs.instance;
    configInstance = configMocks.stubs.instance;
    coreInstance.settings.get.withArgs("path").returns("foo-path");
    coreInstance.settings.get.withArgs("legacy-path").returns("foo-path");
    libsMocks.stubs.fsExtra.existsSync.returns(true);
  });

  afterEach(() => {
    loaderMocks.restore();
    sandbox.restore();
    coreMocks.restore();
    configMocks.restore();
    configInstance.coreOptions = {};
    libsMocks.restore();
  });

  describe("register method", () => {
    const METHOD = "Register";
    it("should do nothing if there are no plugins to register", async () => {
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register object plugins", async () => {
      const fooPlugin = {};
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register object plugins with register method", async () => {
      const fooPlugin = {
        register: () => {},
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register object plugins with register method passing to them the core itself", async () => {
      const fooPlugin = {
        register: sinon.spy(),
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(fooPlugin.register.calledWith(coreInstance)).toEqual(true);
    });

    it("should register object plugins with register method passing to them custom methods", async () => {
      expect.assertions(3);
      const callToLoader = sandbox.stub();
      loaderMocks.stubs.instance.new.returns(callToLoader);
      const fooPlugin = {
        register: (coreIns, methods) => {
          methods.loadLegacyMocks();
          methods.addAlert("foo", "Foo message");
          methods.removeAlerts();
        },
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(callToLoader.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith("2:foo", "Foo message")).toEqual(true);
      expect(callbacks.removeAlerts.calledWith("2:")).toEqual(true);
    });

    it("should not register object plugins with register method throwing an error", async () => {
      const fooPlugin = {
        register: () => {
          throw new Error();
        },
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should not register strings as plugins", async () => {
      expect.assertions(2);
      configInstance.coreOptions.plugins = ["foo"];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(0)}`,
          `Error registering plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should not register booleans as plugins", async () => {
      expect.assertions(2);
      configInstance.coreOptions.plugins = [true];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(0)}`,
          `Error registering plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register function plugins executing them passing the core", async () => {
      expect.assertions(3);
      const fooPlugin = sinon.spy();
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(fooPlugin.calledWith(coreInstance)).toEqual(true);
      expect(fooPlugin.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register function plugins executing them passing custom methods", async () => {
      expect.assertions(3);
      const callToLoader = sandbox.stub();
      loaderMocks.stubs.instance.new.returns(callToLoader);
      const fooPlugin = (coreIns, methods) => {
        methods.loadLegacyMocks();
        methods.addAlert("foo", "Foo message");
        methods.removeAlerts();
        return {};
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(callToLoader.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`${addNativePlugins(0)}:foo`, "Foo message")).toEqual(
        true
      );
      expect(callbacks.removeAlerts.calledWith(`${addNativePlugins(0)}:`)).toEqual(true);
    });

    it("should register function plugins returning a register method", async () => {
      expect.assertions(3);
      const spy = sinon.spy();
      const fooPlugin = () => ({
        register: spy,
      });
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(spy.calledWith(coreInstance)).toEqual(true);
      expect(spy.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should not register function plugins returning a register method which throws an error", async () => {
      const fooPlugin = () => ({
        register: () => {
          throw new Error();
        },
      });
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins, instantiating them passing the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor(core) {
          console.log("Created class");
          receivedCore = core;
          instantiated = true;
        }
      }
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should register class plugins, instantiating them passing custom methods", async () => {
      expect.assertions(3);
      const callToLoader = sandbox.stub();
      loaderMocks.stubs.instance.new.returns(callToLoader);
      class FooPlugin {
        constructor(core, methods) {
          methods.loadLegacyMocks();
          methods.addAlert("foo", "Foo message");
          methods.removeAlerts();
          return {};
        }
      }
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(callToLoader.callCount).toEqual(1);
      expect(callbacks.addAlert.calledWith(`${addNativePlugins(0)}:foo`, "Foo message")).toEqual(
        true
      );
      expect(callbacks.removeAlerts.calledWith(`${addNativePlugins(0)}:`)).toEqual(true);
    });

    it("should not register class plugins if class throw an error when being created", async () => {
      expect.assertions(2);
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(0)}`,
          `Error registering plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should register class plugins with a register method, passing to it the core", async () => {
      expect.assertions(3);
      let instantiated = false;
      let receivedCore;
      class FooPlugin {
        constructor() {
          console.log("Created class");
        }
        register(core) {
          receivedCore = core;
          instantiated = true;
        }
      }
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
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
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should trace the total number of registered plugins", async () => {
      expect.assertions(4);
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      class FooPlugin2 {}
      configInstance.coreOptions.plugins = [
        FooPlugin,
        FooPlugin2,
        () => {},
        true,
        false,
        "foo",
        { foo: "foo" },
      ];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(3)}`,
          `Error registering plugin "${addNativePlugins(3)}"`
        )
      ).toEqual(true);
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(4)}`,
          `Error registering plugin "${addNativePlugins(4)}"`
        )
      ).toEqual(true);
      expect(
        callbacks.addAlert.calledWith(
          `register:${addNativePlugins(5)}`,
          `Error registering plugin "${addNativePlugins(5)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 3))).toEqual(true);
    });
  });

  describe("init method", () => {
    const METHOD = "Initializat";
    it("should do nothing if there are no plugins to register", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should init object plugins with an init property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        init: sinon.spy(),
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(fooPlugin.init.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        init: sinon.spy(),
        displayName: "foo-plugin",
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(tracer.debug.calledWith('Initializing plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept init methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => true,
      };
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method errors and notify alerts", async () => {
      expect.assertions(3);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(callbacks.removeAlerts.calledWith("init")).toEqual(true);
      expect(
        callbacks.addAlert.calledWith(
          `init:${addNativePlugins(0)}`,
          `Error initializating plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch init method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        },
      };
      const fooPlugin2 = {
        init: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        init: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });
  });

  describe("start method", () => {
    const METHOD = "Start";

    it("should do nothing if there are no plugins to register", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should start object plugins with an start property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        start: sinon.spy(),
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(fooPlugin.start.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        start: sinon.spy(),
        displayName: "foo-plugin",
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(tracer.debug.calledWith('Starting plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept start methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => true,
      };
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method errors and notify alert", async () => {
      expect.assertions(3);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(callbacks.removeAlerts.calledWith("start")).toEqual(true);
      expect(
        callbacks.addAlert.calledWith(
          `start:${addNativePlugins(0)}`,
          `Error starting plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch start method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        },
      };
      const fooPlugin2 = {
        start: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        start: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });
  });

  describe("stop method", () => {
    const METHOD = "Stopp";

    it("should do nothing if there are no plugins to stop", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 0))).toEqual(true);
    });

    it("should stop object plugins with an stop property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        stop: sinon.spy(),
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(fooPlugin.stop.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        stop: sinon.spy(),
        displayName: "foo-plugin",
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(tracer.debug.calledWith('Stopping plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept stop methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => true,
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(callbacks.removeAlerts.calledWith("stop")).toEqual(true);
      expect(
        callbacks.addAlert.calledWith(
          `stop:${addNativePlugins(0)}`,
          `Error stopping plugin "${addNativePlugins(0)}"`
        )
      ).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });

    it("should catch stop method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        },
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve(),
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve(),
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
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
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsTraceAddingNative(METHOD, 2))).toEqual(true);
    });
  });

  describe("alerts", () => {
    let fooPlugin;
    beforeEach(() => {
      fooPlugin = {
        register: (core, { addAlert }) => {
          addAlert("test-register", "Testing register alert");
        },
        start: (core, { addAlert }) => {
          addAlert("test-start", "Testing start alert");
        },
        displayName: "foo-name",
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance, callbacks);
    });

    it("should have as scope the plugin index during the register method", async () => {
      await plugins.register();
      expect(callbacks.addAlert.calledWith("2:test-register", "Testing register alert")).toEqual(
        true
      );
    });

    it("should rename the scope if an alert is added during the start method", async () => {
      expect.assertions(2);
      await plugins.register();
      await plugins.start();
      expect(callbacks.renameAlerts.calledWith("2:", "foo-name:")).toEqual(true);
      expect(callbacks.addAlert.calledWith("foo-name:test-start", "Testing start alert")).toEqual(
        true
      );
    });
  });
});
