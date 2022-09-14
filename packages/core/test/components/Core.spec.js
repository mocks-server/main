/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { NestedCollections } = require("@mocks-server/nested-collections");
const { Logger } = require("@mocks-server/logger");

const MockMock = require("./mock/Mock.mock.js");
const ServerMocks = require("./server/Server.mocks.js");
const PluginsMocks = require("./plugins/Plugins.mocks.js");
const ConfigMocks = require("./common/Config.mocks.js");
const FilesLoadersMocks = require("./files/FilesLoaders.mocks.js");
const ScaffoldMocks = require("./scaffold/Scaffold.mocks.js");
const UpdateNotifierMock = require("./update-notifier/UpdateNotifier.mock.js");

const Core = require("../../src/Core");
const Alerts = require("../../src/alerts/Alerts");
const { version } = require("../../package.json");

describe("Core", () => {
  let sandbox;
  let mockMock;
  let mockInstance;
  let serverMocks;
  let serverInstance;
  let pluginsMocks;
  let pluginsInstance;
  let configMocks;
  let filesLoadersMocks;
  let scaffoldMocks;
  let core;
  let updateNotifierMock;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    updateNotifierMock = new UpdateNotifierMock();
    mockMock = new MockMock();
    mockInstance = mockMock.stubs.instance;
    serverMocks = new ServerMocks();
    serverInstance = serverMocks.stubs.instance;
    pluginsMocks = new PluginsMocks();
    pluginsInstance = pluginsMocks.stubs.instance;
    configMocks = new ConfigMocks();
    filesLoadersMocks = new FilesLoadersMocks();
    scaffoldMocks = new ScaffoldMocks();
    sandbox.stub(NestedCollections.prototype, "onChange");
    sandbox.stub(Logger.prototype, "onChangeGlobalStore");
    sandbox.stub(Logger.prototype, "setLevel");

    core = new Core();
    core.variantHandlers._registerOption.value = [];
    await core.init();
  });

  afterEach(() => {
    sandbox.restore();
    mockMock.restore();
    serverMocks.restore();
    configMocks.restore();
    pluginsMocks.restore();
    filesLoadersMocks.restore();
    scaffoldMocks.restore();
    updateNotifierMock.restore();
  });

  describe("when created", () => {
    it("should listen to change logger level when log option changes", async () => {
      core = new Core();
      configMocks.stubs.option.onChange.getCall(0).args[0]("foo-level");
      expect(core.logger.setLevel.getCall(1).args[0]).toEqual("foo-level");
    });
  });

  describe("version", () => {
    it("should return current version", async () => {
      core = new Core();
      expect(core.version).toEqual(version);
    });
  });

  describe("init method", () => {
    it("should init only once", async () => {
      await core.init();
      await core.init();
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should init Config with received config", async () => {
      const fooConfig = { foo: "foo" };
      core = new Core(fooConfig);
      await core.init();
      expect(configMocks.stubs.instance.init.getCall(1).args[0]).toEqual(fooConfig);
    });

    it("should extend config from constructor with config from init", async () => {
      core = new Core({ foo: "foo" });
      await core.init({ foo2: "foo2" });
      expect(configMocks.stubs.instance.init.getCall(1).args[0]).toEqual({
        foo: "foo",
        foo2: "foo2",
      });
    });

    it("should not extend arrays in config", async () => {
      core = new Core({ foo: ["foo", "foo2"] });
      await core.init({ foo: ["foo3", "foo4"] });
      expect(configMocks.stubs.instance.init.getCall(1).args[0]).toEqual({
        foo: ["foo3", "foo4"],
      });
    });

    it("should register plugins", () => {
      expect(pluginsInstance.register.callCount).toEqual(1);
    });

    it("should init server", () => {
      expect(serverInstance.init.callCount).toEqual(1);
    });

    it("should init update notifier", () => {
      expect(updateNotifierMock.stubs.instance.init.callCount).toEqual(1);
    });

    it("should pass pkg advanced option to update notifier if received in constructor", () => {
      core = new Core({ foo: "foo" }, { pkg: { name: "foo-name", version: "foo-version" } });
      expect(updateNotifierMock.stubs.Constructor.mock.calls[1][0].pkg).toEqual({
        name: "foo-name",
        version: "foo-version",
      });
    });

    it("should init scaffold", () => {
      expect(scaffoldMocks.stubs.instance.init.callCount).toEqual(1);
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

  describe("mock getter", () => {
    it("should return routes instance", () => {
      expect(core.mock).toEqual(mockInstance);
    });
  });

  describe("config getter", () => {
    it("should return config instance", () => {
      expect(core.config).toEqual(configMocks.stubs.instance);
    });
  });

  describe("alerts getter", () => {
    it("should return alerts API", () => {
      expect(core.alerts instanceof Alerts).toBe(true);
      expect(core.alerts.id).toEqual("alerts");
    });
  });

  describe("server getter", () => {
    it("should return server", () => {
      expect(core.server).toEqual(serverMocks.stubs.instance);
    });
  });

  describe("variantHandlers getter", () => {
    it("should return variantHandlers", () => {
      expect(core.variantHandlers).toEqual(core._variantHandlers);
    });
  });

  describe("files getter", () => {
    it("should return files instance", () => {
      expect(core.files).toEqual(filesLoadersMocks.stubs.instance);
    });
  });
});
