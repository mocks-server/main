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

const Plugins = require("../../../src/plugins/Plugins");
const tracer = require("../../../src/tracer");

const pluginsQuantity = (method, quantity) => {
  return `${method}ed ${quantity} plugins without errors`;
};

describe("Plugins", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;
  let loaderMocks;
  let plugins;
  let configMocks;
  let configInstance;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "verbose");
    sandbox.stub(tracer, "debug");
    sandbox.stub(tracer, "error");
    sandbox.spy(console, "log");
    coreMocks = new CoreMocks();
    loaderMocks = new LoadersMocks();
    configMocks = new ConfigMocks();
    coreInstance = coreMocks.stubs.instance;
    configInstance = configMocks.stubs.instance;
  });

  afterEach(() => {
    loaderMocks.restore();
    sandbox.restore();
    coreMocks.restore();
    configMocks.restore();
    configInstance.coreOptions = {};
  });

  describe("register method", () => {
    const METHOD = "Register";
    it("should do nothing if there are no plugins to register", async () => {
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should register object plugins", async () => {
      const fooPlugin = {};
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should register object plugins with register method", async () => {
      const fooPlugin = {
        register: () => {}
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should register object plugins with register method passing to it the core itself", async () => {
      const fooPlugin = {
        register: sinon.spy()
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(fooPlugin.register.calledWith(coreInstance)).toEqual(true);
    });

    it("should not register object plugins with register method throwing an error", async () => {
      const fooPlugin = {
        register: () => {
          throw new Error();
        }
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should not register strings as plugins", async () => {
      expect.assertions(2);
      configInstance.coreOptions.plugins = ["foo"];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should not register booleans as plugins", async () => {
      expect.assertions(2);
      configInstance.coreOptions.plugins = [true];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should register function plugins executing them passing the core", async () => {
      expect.assertions(3);
      const fooPlugin = sinon.spy();
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(fooPlugin.calledWith(coreInstance)).toEqual(true);
      expect(fooPlugin.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should register function plugins returning a register method", async () => {
      expect.assertions(3);
      const spy = sinon.spy();
      const fooPlugin = () => ({
        register: spy
      });
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(spy.calledWith(coreInstance)).toEqual(true);
      expect(spy.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should not register function plugins returning a register method which throws an error", async () => {
      const fooPlugin = () => ({
        register: () => {
          throw new Error();
        }
      });
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
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
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should not register class plugins if class throw an error when being created", async () => {
      expect.assertions(2);
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      configInstance.coreOptions.plugins = [FooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
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
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
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
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should trace the total number of registered plugins", async () => {
      expect.assertions(2);
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
        { foo: "foo" }
      ];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 4))).toEqual(true);
    });
  });

  describe("init method", () => {
    const METHOD = "Initializat";
    it("should do nothing if there are no plugins to register", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 0))).toEqual(true);
    });

    it("should init object plugins with an init property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        init: sinon.spy()
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(fooPlugin.init.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        init: sinon.spy(),
        displayName: "foo-plugin"
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.debug.calledWith('Initializing plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept init methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => true
      };
      const fooPlugin2 = {
        init: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should catch init method errors", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => {
          throw new Error();
        }
      };
      const fooPlugin2 = {
        init: () => Promise.resolve()
      };
      const fooPlugin3 = {
        init: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should catch init method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        }
      };
      const fooPlugin2 = {
        init: () => Promise.resolve()
      };
      const fooPlugin3 = {
        init: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should accept plugins with no init method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        init: () => Promise.resolve()
      };
      const fooPlugin3 = {
        init: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });
  });

  describe("start method", () => {
    const METHOD = "Start";

    it("should do nothing if there are no plugins to register", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should start object plugins with an start property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        start: sinon.spy()
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(fooPlugin.start.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        start: sinon.spy(),
        displayName: "foo-plugin"
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.debug.calledWith('Starting plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept start methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => true
      };
      const fooPlugin2 = {
        start: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should catch start method errors", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => {
          throw new Error();
        }
      };
      const fooPlugin2 = {
        start: () => Promise.resolve()
      };
      const fooPlugin3 = {
        start: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should catch start method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        }
      };
      const fooPlugin2 = {
        start: () => Promise.resolve()
      };
      const fooPlugin3 = {
        start: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should accept plugins with no start method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        start: () => Promise.resolve()
      };
      const fooPlugin3 = {
        start: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });
  });

  describe("stop method", () => {
    const METHOD = "Stopp";

    it("should do nothing if there are no plugins to stop", async () => {
      configInstance.coreOptions.plugins = null;
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 1))).toEqual(true);
    });

    it("should stop object plugins with an stop property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        stop: sinon.spy()
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(fooPlugin.stop.callCount).toEqual(1);
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 2))).toEqual(true);
    });

    it("should trace the plugin displayName", async () => {
      const fooPlugin = {
        stop: sinon.spy(),
        displayName: "foo-plugin"
      };
      configInstance.coreOptions.plugins = [fooPlugin];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.debug.calledWith('Stopping plugin "foo-plugin"')).toEqual(true);
    });

    it("should accept stop methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => true
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should catch stop method errors", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => {
          throw new Error();
        }
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve()
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should catch stop method rejected", async () => {
      expect.assertions(1);
      const fooPlugin = {
        stop: () => {
          return new Promise((resolve, reject) => {
            reject(new Error());
          });
        }
      };
      const fooPlugin2 = {
        stop: () => Promise.resolve()
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });

    it("should accept plugins with no stop method", async () => {
      expect.assertions(1);
      const fooPlugin = {};
      const fooPlugin2 = {
        stop: () => Promise.resolve()
      };
      const fooPlugin3 = {
        stop: () => Promise.resolve()
      };
      configInstance.coreOptions.plugins = [fooPlugin, fooPlugin2, fooPlugin3];
      plugins = new Plugins(configInstance, loaderMocks.stubs.instance, coreInstance);
      await plugins.register();
      await plugins.stop();
      expect(tracer.verbose.calledWith(pluginsQuantity(METHOD, 3))).toEqual(true);
    });
  });
});
