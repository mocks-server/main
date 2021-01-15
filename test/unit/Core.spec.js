/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const SettingsMocks = require("./settings/Settings.mocks.js");
const MocksMocks = require("./mocks-legacy/Mocks.mocks.js");
const ServerMocks = require("./server/Server.mocks.js");
const PluginsMocks = require("./plugins/Plugins.mocks.js");
const OrchestratorMocks = require("./Orchestrator.mocks.js");
const ConfigMocks = require("./Config.mocks.js");
const AlertsMocks = require("./Alerts.mocks.js");
const LoadersMocks = require("./Loaders.mocks.js");

const Core = require("../../src/Core");
const tracer = require("../../src/tracer");

describe("Core", () => {
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
  let configMocks;
  let alertsMocks;
  let alertsInstance;
  let loadersMocks;
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
    alertsMocks = new AlertsMocks();
    alertsInstance = alertsMocks.stubs.instance;
    loadersMocks = new LoadersMocks();
    configMocks = new ConfigMocks();

    core = new Core();
    await core.init();
  });

  afterEach(() => {
    sandbox.restore();
    settingsMocks.restore();
    mocksMocks.restore();
    orchestratorMocks.restore();
    serverMocks.restore();
    configMocks.restore();
    pluginsMocks.restore();
    alertsMocks.restore();
    loadersMocks.restore();
  });

  describe("when created", () => {
    it("should create Config with received config", () => {
      const fooConfig = { foo: "foo" };
      core = new Core(fooConfig);
      expect(configMocks.stubs.Constructor.mock.calls[1][1]).toEqual(fooConfig);
    });
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

    it("should init settings with config options", async () => {
      core = new Core();
      await core.init();
      expect(settingsInstance.init.calledWith(configMocks.stubs.instance.options)).toEqual(true);
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

    it("should start plugins only once when called in parallel", async () => {
      core.start();
      core.start();
      core.start();
      await core.start();
      expect(pluginsInstance.start.callCount).toEqual(1);
    });

    it("should start plugins again", async () => {
      core.start();
      await core.start();
      await core.start();
      expect(pluginsInstance.start.callCount).toEqual(2);
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

  describe("onChangeLegacyMocks method", () => {
    it("should add listener to eventEmitter", () => {
      const spy = sandbox.spy();
      core.onChangeLegacyMocks(spy);
      core._eventEmitter.emit("change:mocks:legacy");
      expect(spy.callCount).toEqual(1);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = core.onChangeLegacyMocks(spy);
      core._eventEmitter.emit("change:mocks:legacy");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      core._eventEmitter.emit("change:mocks:legacy");
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

  describe("onChangeAlerts method", () => {
    it("should execute callback when alerts execute onChangeValues callback", () => {
      const FOO_ALERTS = ["foo", "foo2"];
      const spy = sandbox.spy();
      core.onChangeAlerts(spy);
      alertsMocks.stubs.Constructor.mock.calls[0][0].onChangeValues(FOO_ALERTS);
      expect(spy.calledWith(FOO_ALERTS)).toEqual(true);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = core.onChangeAlerts(spy);
      core._eventEmitter.emit("change:alerts");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      core._eventEmitter.emit("change:alerts");
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("when legacyMocksLoaders load something", () => {
    it("should emit an event", (done) => {
      expect.assertions(1);
      core._eventEmitter.on("load:mocks:legacy", () => {
        expect(true).toEqual(true);
        done();
      });
      loadersMocks.stubs.Constructor.mock.calls[0][0].onLoad();
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

    it("should stop plugins only once when called in parallel", async () => {
      core.stop();
      core.stop();
      core.stop();
      await core.stop();
      expect(pluginsInstance.stop.callCount).toEqual(1);
    });

    it("should stop plugins again", async () => {
      core.stop();
      core.stop();
      core.stop();
      await core.stop();
      await core.stop();
      expect(pluginsInstance.stop.callCount).toEqual(2);
    });
  });

  describe("restart method", () => {
    it("should restart server", async () => {
      await core.restart();
      expect(serverInstance.restart.callCount).toEqual(1);
    });
  });

  describe("restartServer method", () => {
    it("should restart server", async () => {
      await core.restartServer();
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

  describe("alerts getter", () => {
    it("should return alerts", () => {
      expect(core.alerts).toEqual(alertsInstance.values);
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
