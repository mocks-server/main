/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const FeaturesMocks = require("./Features.mocks.js");
const SettingsMocks = require("./Settings.mocks.js");

const Api = require("../../../lib/api/Api");

describe("Api", () => {
  let sandbox;
  let featuresMocks;
  let settingsMocks;
  let routerUseStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerUseStub = sandbox.stub();
    sandbox.stub(express, "Router").returns({
      use: routerUseStub
    });
    featuresMocks = new FeaturesMocks();
    settingsMocks = new SettingsMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    featuresMocks.restore();
    settingsMocks.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      new Api();
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should create Features passing the received features folder", () => {
      new Api("foo-path");
      expect(featuresMocks.stubs.Constructor).toHaveBeenCalledWith("foo-path");
    });

    it('should add an express path under "/features"', () => {
      new Api("foo-path");
      expect(routerUseStub.getCall(1).args[0]).toEqual("/features");
    });

    it('should use the created features under the "/features" router path', () => {
      const fooFeaturesRouter = "foo-features-router";
      featuresMocks.stubs.instance.router = fooFeaturesRouter;
      new Api();
      expect(routerUseStub.getCall(1).args[1]).toEqual(fooFeaturesRouter);
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
