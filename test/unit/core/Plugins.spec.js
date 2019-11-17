/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("./Core.mocks.js");

const Plugins = require("../../../lib/core/Plugins");
const tracer = require("../../../lib/core/tracer");

describe("Settings", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;
  let plugins;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "verbose");
    sandbox.stub(tracer, "debug");
    sandbox.stub(tracer, "error");
    sandbox.spy(console, "log");
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("register method", () => {
    it("should do nothing if there are no plugins to register", async () => {
      plugins = new Plugins(null, coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith("Registered 0 plugins")).toEqual(true);
    });

    it("should register object plugins", async () => {
      const fooPlugin = {};
      plugins = new Plugins([fooPlugin], coreInstance);
      await plugins.register();
      expect(tracer.verbose.calledWith("Registered 1 plugins")).toEqual(true);
    });

    it("should not register strings as plugins", async () => {
      expect.assertions(2);
      plugins = new Plugins(["foo"], coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith("Registered 0 plugins")).toEqual(true);
    });

    it("should not register booleans as plugins", async () => {
      expect.assertions(2);
      plugins = new Plugins([true], coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith("Registered 0 plugins")).toEqual(true);
    });

    it("should register function plugins executing them passing the core", async () => {
      expect.assertions(3);
      const fooPlugin = sinon.spy();
      plugins = new Plugins([fooPlugin], coreInstance);
      await plugins.register();
      expect(fooPlugin.calledWith(coreInstance)).toEqual(true);
      expect(fooPlugin.callCount).toEqual(1);
      expect(tracer.verbose.calledWith("Registered 1 plugins")).toEqual(true);
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
      plugins = new Plugins([FooPlugin], coreInstance);
      await plugins.register();
      expect(receivedCore).toEqual(coreInstance);
      expect(instantiated).toEqual(true);
      expect(tracer.verbose.calledWith("Registered 1 plugins")).toEqual(true);
    });

    it("should not register class plugins if class throw an error when being created", async () => {
      expect.assertions(2);
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      plugins = new Plugins([FooPlugin], coreInstance);
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith("Registered 0 plugins")).toEqual(true);
    });

    it("should trace the total number of registered plugins", async () => {
      expect.assertions(2);
      class FooPlugin {
        constructor() {
          throw new Error();
        }
      }
      class FooPlugin2 {}
      plugins = new Plugins(
        [FooPlugin, FooPlugin2, () => {}, true, false, "foo", { foo: "foo" }],
        coreInstance
      );
      await plugins.register();
      expect(console.log.calledWith("Error registering plugin")).toEqual(true);
      expect(tracer.verbose.calledWith("Registered 3 plugins")).toEqual(true);
    });
  });

  describe("init method", () => {
    it("should do nothing if there are no plugins to register", async () => {
      plugins = new Plugins(null, coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith("Initializated 0 plugins")).toEqual(true);
    });

    it("should init object plugins with an init property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        init: sinon.spy()
      };
      plugins = new Plugins([fooPlugin], coreInstance);
      await plugins.register();
      await plugins.init();
      expect(fooPlugin.init.callCount).toEqual(1);
      expect(tracer.verbose.calledWith("Initializated 1 plugins")).toEqual(true);
    });

    it("should accept init methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        init: () => true
      };
      const fooPlugin2 = {
        init: () => Promise.resolve()
      };
      plugins = new Plugins([fooPlugin, fooPlugin2], coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith("Initializated 2 plugins")).toEqual(true);
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
      plugins = new Plugins([fooPlugin, fooPlugin2, fooPlugin3], coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith("Initializated 2 plugins")).toEqual(true);
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
      plugins = new Plugins([fooPlugin, fooPlugin2, fooPlugin3], coreInstance);
      await plugins.register();
      await plugins.init();
      expect(tracer.verbose.calledWith("Initializated 2 plugins")).toEqual(true);
    });
  });

  describe("start method", () => {
    it("should do nothing if there are no plugins to register", async () => {
      plugins = new Plugins(null, coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith("Started 0 plugins")).toEqual(true);
    });

    it("should start object plugins with an init property", async () => {
      expect.assertions(2);
      const fooPlugin = {
        start: sinon.spy()
      };
      plugins = new Plugins([fooPlugin], coreInstance);
      await plugins.register();
      await plugins.start();
      expect(fooPlugin.start.callCount).toEqual(1);
      expect(tracer.verbose.calledWith("Started 1 plugins")).toEqual(true);
    });

    it("should accept start methods non returning a Promise", async () => {
      expect.assertions(1);
      const fooPlugin = {
        start: () => true
      };
      const fooPlugin2 = {
        start: () => Promise.resolve()
      };
      plugins = new Plugins([fooPlugin, fooPlugin2], coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith("Started 2 plugins")).toEqual(true);
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
      plugins = new Plugins([fooPlugin, fooPlugin2, fooPlugin3], coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith("Started 2 plugins")).toEqual(true);
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
      plugins = new Plugins([fooPlugin, fooPlugin2, fooPlugin3], coreInstance);
      await plugins.register();
      await plugins.start();
      expect(tracer.verbose.calledWith("Started 2 plugins")).toEqual(true);
    });
  });
});