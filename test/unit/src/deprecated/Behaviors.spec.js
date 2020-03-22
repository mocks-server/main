/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const sinon = require("sinon");

const CoreMocks = require("../../Core.mocks.js");

const Behaviors = require("../../../../src/deprecated/Behaviors");

describe("Behaviors Api", () => {
  let sandbox;
  let routerStubs;
  let resMock;
  let statusSpy;
  let sendSpy;
  let coreMock;
  let coreMocks;
  let tracerMock;
  let behaviors;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routerStubs = {
      get: sandbox.stub(),
      put: sandbox.stub(),
    };
    coreMock = new CoreMocks();
    coreMocks = coreMock.stubs.instance;
    tracerMock = coreMocks.tracer;
    sandbox.stub(express, "Router").returns(routerStubs);
    statusSpy = sandbox.spy();
    sendSpy = sandbox.spy();
    resMock = {
      status: statusSpy,
      send: sendSpy,
    };
    behaviors = new Behaviors(coreMocks, tracerMock);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    coreMock.restore();
  });

  describe("when instanciated", () => {
    it("should create an express Router", () => {
      expect(express.Router.calledOnce).toEqual(true);
    });
  });

  describe("getCurrent route", () => {
    it("should set response status as 200", () => {
      behaviors.getCurrent({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current feature from collection", () => {
      behaviors.getCurrent({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual(coreMocks.behaviors.currentFromCollection);
    });
  });

  describe("putCurrent route", () => {
    it("should set current feature", () => {
      behaviors.putCurrent(
        {
          body: {
            name: "foo-name",
          },
        },
        resMock
      );
      expect(coreMocks.settings.set.getCall(0).args).toEqual(["behavior", "foo-name"]);
    });

    it("should send current feature from collection", () => {
      behaviors.putCurrent(
        {
          body: {
            name: "foo-name",
          },
        },
        resMock
      );
      expect(sendSpy.getCall(0).args[0]).toEqual(coreMocks.behaviors.currentFromCollection);
    });
  });

  describe("getCollection route", () => {
    it("should set response status as 200", () => {
      behaviors.getCollection({}, resMock);
      expect(statusSpy.getCall(0).args[0]).toEqual(200);
    });

    it("should send current behaviors collection", () => {
      behaviors.getCollection({}, resMock);
      expect(sendSpy.getCall(0).args[0]).toEqual(coreMocks.behaviors.collection);
    });
  });

  describe("router getter", () => {
    it("should return the express router", () => {
      expect(behaviors.router).toEqual(routerStubs);
    });
  });
});
