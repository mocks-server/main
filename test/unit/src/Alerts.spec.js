/*
Copyright 2020 Javier Brea
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

const Alerts = require("../../../src/Alerts");

describe("Alerts", () => {
  let sandbox;
  let libMocks;
  let coreMock;
  let coreInstance;
  let resMock;
  let alerts;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    resMock = {
      status: sandbox.stub(),
      send: sandbox.stub(),
    };
    libMocks = new LibMocks();
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    alerts = new Alerts(coreInstance);
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

    it("should have added get router at /", async () => {
      expect(libMocks.stubs.express.get.getCall(0).args[0]).toEqual("/");
    });

    it("should register a get router for alert ids", async () => {
      expect(libMocks.stubs.express.get.getCall(1).args[0]).toEqual("/:id");
    });
  });

  describe("getCollection router", () => {
    it("should return the alerts parsed", () => {
      expect.assertions(6);
      coreInstance.alerts = [
        {
          context: "plugins:foo:start",
          message: "Foo warning starting plugin",
        },
        {
          context: "plugins:foo2:stop",
          message: "Foo error stopping plugin 2",
          error: new Error("Foo error message"),
        },
      ];
      alerts = new Alerts(coreInstance);
      alerts.getCollection({}, resMock);
      expect(resMock.send.getCall(0).args[0][0]).toEqual({
        id: "plugins:foo:start",
        context: "plugins:foo:start",
        message: "Foo warning starting plugin",
        error: null,
      });
      expect(resMock.send.getCall(0).args[0][1].id).toEqual("plugins:foo2:stop");
      expect(resMock.send.getCall(0).args[0][1].context).toEqual("plugins:foo2:stop");
      expect(resMock.send.getCall(0).args[0][1].message).toEqual("Foo error stopping plugin 2");
      expect(resMock.send.getCall(0).args[0][1].error.message).toEqual("Foo error message");
      expect(resMock.send.getCall(0).args[0][1].error.stack).toEqual(
        expect.stringContaining("test/unit/src/Alerts.spec.js:73:18")
      );
    });
  });

  describe("getModel router", () => {
    it("should return the requested alert model parsed", () => {
      coreInstance.alerts = [
        {
          context: "plugins:foo:start",
          message: "Foo warning starting plugin",
        },
        {
          context: "plugins:foo2:stop",
          message: "Foo error stopping plugin 2",
          error: new Error("Foo error message"),
        },
      ];
      alerts = new Alerts(coreInstance);
      alerts.getModel(
        {
          params: {
            id: "plugins:foo:start",
          },
        },
        resMock
      );
      expect(resMock.send.getCall(0).args[0]).toEqual({
        id: "plugins:foo:start",
        context: "plugins:foo:start",
        message: "Foo warning starting plugin",
        error: null,
      });
    });

    it("should return a not found error if alert is not found", () => {
      const nextStub = sandbox.stub();
      sandbox.stub(Boom, "notFound").returns("foo-error");
      coreInstance.alerts = [
        {
          context: "plugins:foo:start",
          message: "Foo warning starting plugin",
        },
      ];
      alerts = new Alerts(coreInstance);
      alerts.getModel(
        {
          params: {
            id: "foo",
          },
        },
        resMock,
        nextStub
      );
      expect(nextStub.getCall(0).args[0]).toEqual("foo-error");
    });
  });

  describe("router getter", () => {
    it("should return express created router", async () => {
      expect(alerts.router).toEqual(libMocks.stubs.express);
    });
  });
});
