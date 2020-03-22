/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const LibMocks = require("../Libs.mocks");
const CoreMocks = require("../Core.mocks");
const DeprecatedApiMocks = require("./deprecated/Api.mocks");
const SettingsMocks = require("./Settings.mocks");
const BehaviorsMocks = require("./Behaviors.mocks");
const FixturesMock = require("./Fixtures.mocks");
const AboutMock = require("./About.mocks");

const Plugin = require("../../../src/Plugin");

describe("Plugin", () => {
  let sandbox;
  let libMocks;
  let settingsMocks;
  let behaviorsMocks;
  let fixturesMock;
  let deprecatedApiMock;
  let deprecatedApiInstance;
  let coreMock;
  let coreInstance;
  let aboutMock;
  let plugin;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    libMocks = new LibMocks();
    settingsMocks = new SettingsMocks();
    behaviorsMocks = new BehaviorsMocks();
    aboutMock = new AboutMock();
    fixturesMock = new FixturesMock();
    deprecatedApiMock = new DeprecatedApiMocks();
    deprecatedApiInstance = deprecatedApiMock.stubs.instance;
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    plugin = new Plugin(coreInstance);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    libMocks.restore();
    settingsMocks.restore();
    behaviorsMocks.restore();
    fixturesMock.restore();
    coreMock.restore();
    aboutMock.restore();
    deprecatedApiMock.restore();
  });

  describe("display name", () => {
    it("should return package name", async () => {
      expect(plugin.displayName).toEqual("@mocks-server/plugin-admin-api");
    });
  });

  describe("when initializated", () => {
    it("should create an express Router", async () => {
      await plugin.init();
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should have added adminApiPath setting", async () => {
      await plugin.init();
      expect(coreInstance.addSetting.getCall(0).args[0].name).toEqual("adminApiPath");
    });

    it("should have added adminApiDeprecatedPaths setting", async () => {
      await plugin.init();
      expect(coreInstance.addSetting.getCall(1).args[0].name).toEqual("adminApiDeprecatedPaths");
    });

    it("should init deprecated api", async () => {
      await plugin.init();
      expect(deprecatedApiInstance.init.callCount).toEqual(1);
    });

    it("should add deprecated router if adminApiDeprecatedPaths setting returns true", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(true);
      await plugin.init();
      expect(coreInstance.addRouter.callCount).toEqual(2);
    });

    it("should not add deprecated router if adminApiDeprecatedPaths setting returns false", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(false);
      await plugin.init();
      expect(coreInstance.addRouter.callCount).toEqual(1);
    });

    it("should register Express router into the core under the path returned by settings", async () => {
      coreInstance.settings.get.withArgs("adminApiPath").returns("/foo");
      await plugin.init();
      expect(coreInstance.addRouter.getCall(0).args).toEqual(["/foo", plugin._router]);
    });
  });

  describe("when settings change", () => {
    it("should not register deprecated router again if it is enabled and was already registered", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(true);
      await plugin.init();
      coreInstance.onChangeSettings.getCall(0).args[0]({
        adminApiDeprecatedPaths: true,
      });
      expect(coreInstance.addRouter.callCount).toEqual(2);
    });

    it("should remove deprecated router if it is disabled and was already enabled", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(true);
      await plugin.init();
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(false);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        adminApiDeprecatedPaths: false,
      });
      expect(coreInstance.removeRouter.callCount).toEqual(1);
    });

    it("should not remove deprecated router if it was not added", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(false);
      await plugin.init();
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(false);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        adminApiDeprecatedPaths: false,
      });
      expect(coreInstance.removeRouter.callCount).toEqual(0);
    });

    it("should remove and add router again if adminApiPath option changes", async () => {
      expect.assertions(3);
      coreInstance.settings.get.withArgs("adminApiPath").returns("/foo");
      await plugin.init();
      coreInstance.settings.get.withArgs("adminApiPath").returns("/foo2");
      coreInstance.onChangeSettings.getCall(0).args[0]({
        adminApiPath: "/foo2",
      });
      expect(coreInstance.removeRouter.callCount).toEqual(1);
      expect(coreInstance.addRouter.callCount).toEqual(2);
      expect(coreInstance.addRouter.getCall(1).args).toEqual(["/foo2", plugin._router]);
    });
  });
});
