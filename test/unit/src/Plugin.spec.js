/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const CoreMocks = require("../Core.mocks.js");
const DeprecatedApiMocks = require("./deprecated/Api.mocks.js");

const Plugin = require("../../../src/Plugin");

describe("Plugin", () => {
  let sandbox;
  let deprecatedApiMock;
  let deprecatedApiInstance;
  let coreMock;
  let coreInstance;
  let routerUseStub;
  let plugin;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerUseStub = sandbox.stub();
    deprecatedApiMock = new DeprecatedApiMocks();
    deprecatedApiInstance = deprecatedApiMock.stubs.instance;
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    sandbox.stub(express, "Router").returns({
      use: routerUseStub
    });
    plugin = new Plugin(coreInstance);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    coreMock.restore();
    deprecatedApiMock.restore();
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

    it("should init deprecated api if adminApiDeprecatedPaths setting returns true", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(true);
      await plugin.init();
      expect(deprecatedApiInstance.init.callCount).toEqual(1);
    });

    it("should not init deprecated api if adminApiDeprecatedPaths setting returns false", async () => {
      coreInstance.settings.get.withArgs("adminApiDeprecatedPaths").returns(false);
      await plugin.init();
      expect(deprecatedApiInstance.init.callCount).toEqual(0);
    });

    it("should register Express router into the core under the path returned by settings", async () => {
      coreInstance.settings.get.withArgs("adminApiPath").returns("/foo");
      await plugin.init();
      expect(coreInstance.addRouter.getCall(0).args).toEqual(["/foo", plugin._router]);
    });

    it("should send response when express router is called under path /", async () => {
      expect.assertions(2);
      await plugin.init();
      const resStub = sandbox.stub();
      routerUseStub.getCall(0).args[1](
        null,
        {
          send: resStub
        },
        null
      );
      expect(routerUseStub.getCall(0).args[0]).toEqual("/");
      expect(resStub.getCall(0).args[0]).toEqual({
        listening: true
      });
    });
  });
});
