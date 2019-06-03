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
      expect(routerUseStub.getCall(0).args[0]).toEqual("/features");
    });

    it('should use the created features under the "/features" router path', () => {
      const fooFeaturesRouter = "foo-features-router";
      featuresMocks.stubs.instance.router = fooFeaturesRouter;
      new Api();
      expect(routerUseStub.getCall(0).args[1]).toEqual(fooFeaturesRouter);
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
