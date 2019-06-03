const express = require("express");
const sinon = require("sinon");

const SettingsMocks = require("../lib/Settings.mocks.js");

const Settings = require("../../../lib/api/Settings");

describe.only("Settings Api", () => {
  let sandbox;
  let routerStubs;
  let resMock;
  let statusSpy;
  let sendSpy;
  let settingsMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerStubs = {
      get: sandbox.stub(),
      put: sandbox.stub()
    };
    settingsMocks = new SettingsMocks();
    sandbox.stub(express, "Router").returns(routerStubs);
    statusSpy = sandbox.spy();
    sendSpy = sandbox.spy();
    resMock = {
      status: statusSpy,
      send: sendSpy
    };
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    settingsMocks.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      new Settings();
      expect(express.Router.calledOnce).toEqual(true);
    });
  });

  describe("get route", () => {
    it("should set response status as 200", () => {
      const settings = new Settings(settingsMocks);
      settings.get({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current settings", () => {
      settingsMocks.delay = 3000;
      const settings = new Settings(settingsMocks);
      settings.get({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual({
        delay: 3000
      });
    });
  });

  describe("put route", () => {
    it("should set current delay", () => {
      const settings = new Settings(settingsMocks);
      settings.put(
        {
          body: {
            delay: 5000
          }
        },
        resMock
      );
      expect(settings._settings.delay).toEqual(5000);
    });

    it("should send current settings", () => {
      const settings = new Settings(settingsMocks);
      settings.put(
        {
          body: {
            delay: 2000
          }
        },
        resMock
      );
      expect(sendSpy.getCall(0).args[0]).toEqual({
        delay: 2000
      });
    });
  });

  describe("router getter", () => {
    it("should return the express router", () => {
      const settings = new Settings(settingsMocks);
      expect(settings.router).toEqual(routerStubs);
    });
  });
});
