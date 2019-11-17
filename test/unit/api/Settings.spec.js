/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const CoreMocks = require("../core/Core.mocks.js");

const Settings = require("../../../lib/api/Settings");

describe("Settings Api", () => {
  let sandbox;
  let routerStubs;
  let resMock;
  let statusSpy;
  let sendSpy;
  let coreMocks;
  let settingsMock;
  let tracerMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerStubs = {
      get: sandbox.stub(),
      put: sandbox.stub()
    };
    coreMocks = new CoreMocks();
    settingsMock = coreMocks.stubs.instance.settings;
    tracerMock = coreMocks.stubs.instance.tracer;
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
    coreMocks.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      new Settings(settingsMock, tracerMock);
      expect(express.Router.calledOnce).toEqual(true);
    });
  });

  describe("get route", () => {
    it("should set response status as 200", () => {
      const settings = new Settings(settingsMock, tracerMock);
      settings.get({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current settings", () => {
      settingsMock.get.withArgs("delay").returns(3000);
      const settings = new Settings(settingsMock, tracerMock);
      settings.get({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual({
        delay: 3000
      });
    });
  });

  describe("put route", () => {
    it("should set current delay", () => {
      const settings = new Settings(settingsMock, tracerMock);
      settings.put(
        {
          body: {
            delay: 5000
          }
        },
        resMock
      );
      expect(settingsMock.set.getCall(0).args).toEqual(["delay", 5000]);
    });

    it("should send current settings", () => {
      const settings = new Settings(settingsMock, tracerMock);
      settingsMock.get.withArgs("delay").returns(2000);
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
      const settings = new Settings(settingsMock, tracerMock);
      expect(settings.router).toEqual(routerStubs);
    });
  });
});
