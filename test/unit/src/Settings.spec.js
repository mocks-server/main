/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");
const Boom = require("@hapi/boom");

const LibMocks = require("../Libs.mocks");
const CoreMocks = require("../Core.mocks");

const Settings = require("../../../src/Settings");

describe("Fixtures", () => {
  let sandbox;
  let libMocks;
  let coreMock;
  let coreInstance;
  let resMock;
  let nextStub;
  let settings;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    nextStub = sandbox.stub();
    resMock = {
      status: sandbox.stub(),
      send: sandbox.stub()
    };
    libMocks = new LibMocks();
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    settings = new Settings(coreInstance);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    libMocks.restore();
    coreMock.restore();
  });

  describe("when created", () => {
    it("should create an express Router", async () => {
      expect(express.Router.calledOnce).toEqual(true);
    });

    it("should have added a patch router at /", async () => {
      expect(libMocks.stubs.express.get.getCall(0).args[0]).toEqual("/");
    });

    it("should have added a get router at /", async () => {
      expect(libMocks.stubs.express.get.getCall(0).args[0]).toEqual("/");
    });
  });

  describe("patch router", () => {
    it("should set new settings", () => {
      expect.assertions(4);
      coreInstance.settings.getValidOptionName.withArgs("log").returns("log");
      coreInstance.settings.getValidOptionName.withArgs("delay").returns("delay");
      settings = new Settings(coreInstance);
      settings.patch(
        {
          body: {
            log: "foo",
            delay: 4000
          }
        },
        resMock,
        nextStub
      );
      expect(coreInstance.settings.set.getCall(0).args[0]).toEqual("log");
      expect(coreInstance.settings.set.getCall(0).args[1]).toEqual("foo");
      expect(coreInstance.settings.set.getCall(1).args[0]).toEqual("delay");
      expect(coreInstance.settings.set.getCall(1).args[1]).toEqual(4000);
    });

    it("should send a badRequest error if there is any invalid option", () => {
      sandbox.stub(Boom, "badRequest").returns("foo-error");
      coreInstance.settings.getValidOptionName.withArgs("log").returns(null);
      coreInstance.settings.getValidOptionName.withArgs("delay").returns("delay");
      settings = new Settings(coreInstance);
      settings.patch(
        {
          body: {
            log: "foo",
            delay: 4000
          }
        },
        resMock,
        nextStub
      );
      expect(nextStub.getCall(0).args[0]).toEqual("foo-error");
    });

    it("should not set any option if one is invalid", () => {
      sandbox.stub(Boom, "badRequest").returns("foo-error");
      coreInstance.settings.getValidOptionName.withArgs("log").returns("log");
      coreInstance.settings.getValidOptionName.withArgs("delay").returns(null);
      settings = new Settings(coreInstance);
      settings.patch(
        {
          body: {
            log: "foo",
            delay: 4000
          }
        },
        resMock,
        nextStub
      );
      expect(coreInstance.settings.set.callCount).toEqual(0);
    });
  });

  describe("get router", () => {
    it("should return all settings", () => {
      settings = new Settings(coreInstance);
      settings.get({}, resMock, nextStub);
      expect(resMock.send.getCall(0).args[0]).toEqual(coreInstance.settings.all);
    });
  });

  describe("router getter", () => {
    it("should return express created router", async () => {
      expect(settings.router).toEqual(libMocks.stubs.express);
    });
  });
});
