/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const LibsMocks = require("../../Libs.mocks");
const CoreMocks = require("../../Core.mocks.js");
const BehaviorsMocks = require("./Behaviors.mocks.js");
const SettingsMocks = require("./Settings.mocks.js");

const Api = require("../../../../src/deprecated/Api");

describe("Api", () => {
  let sandbox;
  let libMocks;
  let behaviorsMocks;
  let settingsMocks;
  let coreMock;
  let coreMocks;
  let api;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    libMocks = new LibsMocks();
    coreMock = new CoreMocks();
    coreMocks = coreMock.stubs.instance;
    behaviorsMocks = new BehaviorsMocks();
    settingsMocks = new SettingsMocks();
    api = new Api(coreMocks);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    libMocks.restore();
    behaviorsMocks.restore();
    settingsMocks.restore();
    coreMock.restore();
  });

  describe("when initializated", () => {
    it("should create an express Router", async () => {
      await api.init();
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should create Behaviors passing the core", async () => {
      await api.init();
      expect(behaviorsMocks.stubs.Constructor).toHaveBeenCalledWith(coreMocks);
    });

    it('should trace a warning each time any path under "/mocks" is requested', async () => {
      expect.assertions(2);
      await api.init();
      const nextStub = sandbox.stub();
      libMocks.stubs.express.use.getCall(0).args[0](null, null, nextStub);
      expect(nextStub.callCount).toEqual(1);
      expect(coreMocks.tracer.deprecationWarn.getCall(0).args[0]).toEqual(
        expect.stringContaining('"/mocks" plugin-admin-api path')
      );
    });

    it('should add an express path under "/features"', async () => {
      await api.init();
      expect(libMocks.stubs.express.use.getCall(1).args[0]).toEqual("/features");
    });

    it('should use the created behaviors under the "/features" router path', async () => {
      await api.init();
      const fooBehaviorsRouter = "foo-behaviors-router";
      behaviorsMocks.stubs.instance.router = fooBehaviorsRouter;
      expect(libMocks.stubs.express.use.getCall(1).args[1]).toEqual(fooBehaviorsRouter);
    });

    it('should add an express path under "/behaviors"', async () => {
      await api.init();
      expect(libMocks.stubs.express.use.getCall(2).args[0]).toEqual("/behaviors");
    });

    it('should use the created behaviors under the "/behaviors" router path', async () => {
      await api.init();
      const fooBehaviorsRouter = "foo-behaviors-router";
      behaviorsMocks.stubs.instance.router = fooBehaviorsRouter;
      expect(libMocks.stubs.express.use.getCall(2).args[1]).toEqual(fooBehaviorsRouter);
    });
  });

  describe("router getter", () => {
    it("should return express created router", async () => {
      await api.init();
      expect(api.router).toEqual(libMocks.stubs.express);
    });
  });
});
