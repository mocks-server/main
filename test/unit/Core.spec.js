/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const SettingsMocks = require("./settings/Settings.mocks.js");
const MocksMocks = require("./mocks/Mocks.mocks.js");
const ServerMocks = require("./server/Server.mocks.js");
const PluginsMocks = require("./plugins/Plugins.mocks.js");
const OrchestratorMocks = require("./Orchestrator.mocks.js");

const Core = require("../../src/Core");
const tracer = require("../../src/tracer");

describe("Settings", () => {
  let sandbox;
  let settingsMocks;
  let settingsInstance;
  let mocksMocks;
  let orchestratorMocks;
  let mocksInstance;
  let serverMocks;
  let serverInstance;
  let pluginsMocks;
  let pluginsInstance;
  let core;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    settingsMocks = new SettingsMocks();
    settingsInstance = settingsMocks.stubs.instance;
    mocksMocks = new MocksMocks();
    mocksInstance = mocksMocks.stubs.instance;
    serverMocks = new ServerMocks();
    serverInstance = serverMocks.stubs.instance;
    pluginsMocks = new PluginsMocks();
    pluginsInstance = pluginsMocks.stubs.instance;
    orchestratorMocks = new OrchestratorMocks();

    core = new Core();
    await core.init();
  });

  afterEach(() => {
    sandbox.restore();
    settingsMocks.restore();
    mocksMocks.restore();
    orchestratorMocks.restore();
    serverMocks.restore();
    pluginsMocks.restore();
  });

  describe("init method", () => {
    it("should init only once", async () => {
      await core.init();
      await core.init();
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should register plugins", () => {
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should init settings with received options", async () => {
      const fooOptions = {
        foo: "foo"
      };
      core = new Core();
      await core.init(fooOptions);
      expect(settingsInstance.init.calledWith(fooOptions)).toEqual(true);
    });

    it("should init mocks", () => {
      expect(mocksInstance.init.callCount).toEqual(1);
    });

    it("should init server", () => {
      expect(serverInstance.init.callCount).toEqual(1);
    });

    it("should init plugins", () => {
      expect(pluginsInstance.init.callCount).toEqual(1);
    });
  });

  describe("start method", () => {
    it("should init if it has not been done before", async () => {
      pluginsMocks.reset();
      pluginsMocks = new PluginsMocks();
      pluginsInstance = pluginsMocks.stubs.instance;
      core = new Core();
      await core.start();
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should not init if it has been done before", async () => {
      await core.start();
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should start server", async () => {
      await core.start();
      expect(serverInstance.start.callCount).toEqual(1);
    });

    it("should start plugins", async () => {
      await core.start();
      expect(pluginsInstance.start.callCount).toEqual(1);
    });

    it("should start plugins only once", async () => {
      core.start();
      core.start();
      core.start();
      await core.start();
      expect(pluginsInstance.start.callCount).toEqual(1);
    });
  });

  describe("addCustomRouter method", () => {
    it("should add custom router to server", () => {
      core.addCustomRouter();
      expect(serverInstance.addCustomRouter.callCount).toEqual(1);
    });
  });

  describe("addRouter method", () => {
    it("should add router to server", () => {
      core.addRouter();
      expect(serverInstance.addCustomRouter.callCount).toEqual(1);
    });
  });

  describe("removeRouter method", () => {
    it("should remove router from server", () => {
      core.removeRouter();
      expect(serverInstance.removeCustomRouter.callCount).toEqual(1);
    });
  });

  describe("addCustomSetting method", () => {
    it("should add custom setting to settings", () => {
      core.addCustomSetting();
      expect(settingsInstance.addCustom.callCount).toEqual(1);
    });
  });

  describe("addSetting method", () => {
    it("should add setting to settings", () => {
      core.addSetting();
      expect(settingsInstance.addCustom.callCount).toEqual(1);
    });
  });

  describe("addFixturesHandler method", () => {
    it("should add fixturesHandler to mocks", () => {
      core.addFixturesHandler();
      expect(mocksInstance.addFixturesHandler.callCount).toEqual(1);
    });
  });

  describe("onLoadMocks method", () => {
    it("should add listener to eventEmitter", () => {
      const spy = sandbox.spy();
      core.onLoadMocks(spy);
      core._eventEmitter.emit("change:mocks");
      expect(spy.callCount).toEqual(1);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = core.onLoadMocks(spy);
      core._eventEmitter.emit("change:mocks");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      core._eventEmitter.emit("change:mocks");
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("onLoadFiles method", () => {
    it("should add listener to eventEmitter", () => {
      const spy = sandbox.spy();
      core.onLoadFiles(spy);
      core._eventEmitter.emit("load:mocks");
      expect(spy.callCount).toEqual(1);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = core.onLoadFiles(spy);
      core._eventEmitter.emit("load:mocks");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      core._eventEmitter.emit("load:mocks");
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("onChangeSettings method", () => {
    it("should add listener to eventEmitter", () => {
      const spy = sandbox.spy();
      core.onChangeSettings(spy);
      core._eventEmitter.emit("change:settings");
      expect(spy.callCount).toEqual(1);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = core.onChangeSettings(spy);
      core._eventEmitter.emit("change:settings");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      core._eventEmitter.emit("change:settings");
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("stop method", () => {
    it("should stop server", async () => {
      await core.stop();
      expect(serverInstance.stop.callCount).toEqual(1);
    });

    it("should stop plugins", async () => {
      await core.stop();
      expect(pluginsInstance.stop.callCount).toEqual(1);
    });

    it("should stop plugins only once", async () => {
      core.stop();
      core.stop();
      core.stop();
      await core.stop();
      expect(pluginsInstance.stop.callCount).toEqual(1);
    });
  });

  describe("restart method", () => {
    it("should restart server", async () => {
      await core.restart();
      expect(serverInstance.restart.callCount).toEqual(1);
    });
  });

  describe("tracer getter", () => {
    it("should return tracer instance", () => {
      expect(core.tracer).toEqual(tracer);
    });
  });

  describe("serverError getter", () => {
    it("should return server error", () => {
      expect(core.serverError).toEqual(serverInstance.error);
    });
  });

  describe("settings getter", () => {
    it("should return settings", () => {
      expect(core.settings).toEqual(settingsInstance);
    });
  });

  describe("behaviors getter", () => {
    it("should return mocks behaviors", () => {
      expect(core.behaviors).toEqual(mocksInstance.behaviors);
    });
  });

  describe("features getter", () => {
    it("should return mocks behaviors", () => {
      expect(core.features).toEqual(mocksInstance.behaviors);
    });
  });

  describe("fixtures getter", () => {
    it("should return mocks fixtures", () => {
      expect(core.fixtures).toEqual(mocksInstance.fixtures);
    });
  });
});
