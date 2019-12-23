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

const Behaviors = require("../../../src/Behaviors");

describe("Behavior", () => {
  let sandbox;
  let libMocks;
  let coreMock;
  let coreInstance;
  let resMock;
  let behaviors;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    resMock = {
      status: sandbox.stub(),
      send: sandbox.stub()
    };
    libMocks = new LibMocks();
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    behaviors = new Behaviors(coreInstance);
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

    it("should register a get router for behavior names", async () => {
      expect(libMocks.stubs.express.get.getCall(1).args[0]).toEqual("/:name");
    });
  });

  describe("getCollection router", () => {
    it("should return the behaviors collection parsed", () => {
      coreInstance.behaviors = {
        collection: [
          {
            name: "foo",
            fixtures: [{ id: "foo-fixture-id-1" }, { id: "foo-fixture-id-2" }],
            extendedFrom: "foo-base-behavior"
          },
          {
            name: "foo2",
            fixtures: [{ id: "foo-fixture-id-3" }],
            extendedFrom: null
          }
        ]
      };
      behaviors = new Behaviors(coreInstance);
      behaviors.getCollection({}, resMock);
      expect(resMock.send.getCall(0).args[0]).toEqual([
        {
          name: "foo",
          fixtures: ["foo-fixture-id-1", "foo-fixture-id-2"],
          extendedFrom: "foo-base-behavior"
        },
        {
          name: "foo2",
          fixtures: ["foo-fixture-id-3"],
          extendedFrom: null
        }
      ]);
    });
  });

  describe("getModel router", () => {
    it("should return the requested behavior model parsed", () => {
      coreInstance.behaviors = {
        collection: [
          {
            name: "foo",
            fixtures: [{ id: "foo-fixture-id-1" }, { id: "foo-fixture-id-2" }],
            extendedFrom: "foo-base-behavior"
          },
          {
            name: "foo2",
            fixtures: [{ id: "foo-fixture-id-3" }],
            extendedFrom: null
          }
        ]
      };
      behaviors = new Behaviors(coreInstance);
      behaviors.getModel(
        {
          params: {
            name: "foo"
          }
        },
        resMock
      );
      expect(resMock.send.getCall(0).args[0]).toEqual({
        name: "foo",
        fixtures: ["foo-fixture-id-1", "foo-fixture-id-2"],
        extendedFrom: "foo-base-behavior"
      });
    });

    it("should return a not found error if behavior is not found", () => {
      const nextStub = sandbox.stub();
      sandbox.stub(Boom, "notFound").returns("foo-error");
      coreInstance.behaviors = {
        collection: [
          {
            name: "foo",
            fixtures: [{ id: "foo-fixture-id-1" }, { id: "foo-fixture-id-2" }],
            extendedFrom: "foo-base-behavior"
          },
          {
            name: "foo2",
            fixtures: [{ id: "foo-fixture-id-3" }],
            extendedFrom: null
          }
        ]
      };
      behaviors = new Behaviors(coreInstance);
      behaviors.getModel(
        {
          params: {
            name: "foo3"
          }
        },
        resMock,
        nextStub
      );
      expect(nextStub.getCall(0).args[0]).toEqual("foo-error");
    });
  });

  describe("router getter", () => {
    it("should return express created router", async () => {
      expect(behaviors.router).toEqual(libMocks.stubs.express);
    });
  });
});
