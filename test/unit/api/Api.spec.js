/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const BehaviorsMocks = require("./Behaviors.mocks.js");
const SettingsMocks = require("./Settings.mocks.js");

const tracer = require("../../../lib/core/tracer");
const Api = require("../../../lib/api/Api");

describe("Api", () => {
  let sandbox;
  let behaviorsMocks;
  let settingsMocks;
  let routerUseStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "warn");
    routerUseStub = sandbox.stub();
    sandbox.stub(express, "Router").returns({
      use: routerUseStub
    });
    behaviorsMocks = new BehaviorsMocks();
    settingsMocks = new SettingsMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    behaviorsMocks.restore();
    settingsMocks.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      new Api();
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should create Features passing the received mocks folder", () => {
      new Api("foo-path");
      expect(behaviorsMocks.stubs.Constructor).toHaveBeenCalledWith("foo-path");
    });

    it('should trace a warning each time any path under "/features" is requested', () => {
      expect.assertions(3);
      new Api("foo-path");
      const nextStub = sandbox.stub();
      routerUseStub.getCall(0).args[1](null, null, nextStub);
      expect(routerUseStub.getCall(0).args[0]).toEqual("/features");
      expect(nextStub.callCount).toEqual(1);
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning: ")
      );
    });

    it('should add an express path under "/features"', () => {
      new Api("foo-path");
      expect(routerUseStub.getCall(1).args[0]).toEqual("/features");
    });

    it('should use the created behaviors under the "/features" router path', () => {
      const fooBehaviorsRouter = "foo-features-router";
      behaviorsMocks.stubs.instance.router = fooBehaviorsRouter;
      new Api();
      expect(routerUseStub.getCall(1).args[1]).toEqual(fooBehaviorsRouter);
    });

    it('should add an express path under "/behaviors"', () => {
      new Api("foo-path");
      expect(routerUseStub.getCall(2).args[0]).toEqual("/behaviors");
    });

    it('should use the created behaviors under the "/behaviors" router path', () => {
      const fooBehaviorsRouter = "foo-behaviors-router";
      behaviorsMocks.stubs.instance.router = fooBehaviorsRouter;
      new Api();
      expect(routerUseStub.getCall(2).args[1]).toEqual(fooBehaviorsRouter);
    });
  });

  describe("router getter", () => {
    it("should return the express router", () => {
      const api = new Api();
      expect(api.router).toEqual({
        use: routerUseStub
      });
    });
  });
});
