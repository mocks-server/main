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

const Fixtures = require("../../../src/Fixtures");

describe("Fixtures", () => {
  let sandbox;
  let libMocks;
  let coreMock;
  let coreInstance;
  let resMock;
  let fixtures;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    resMock = {
      status: sandbox.stub(),
      send: sandbox.stub(),
    };
    libMocks = new LibMocks();
    coreMock = new CoreMocks();
    coreInstance = coreMock.stubs.instance;
    fixtures = new Fixtures(coreInstance);
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

    it("should register a get router for fixtures ids", async () => {
      expect(libMocks.stubs.express.get.getCall(1).args[0]).toEqual("/:id");
    });
  });

  describe("getCollection router", () => {
    it("should return the fixtures collection parsed", () => {
      coreInstance.fixtures = {
        collection: [
          {
            id: "foo-id",
            requestMatchId: "request-match-id",
            request: "foo-request",
            response: "foo-response",
          },
          {
            id: "foo-id-2",
            requestMatchId: "request-match-id-2",
            request: "foo-request-2",
            response: "foo-response-2",
          },
        ],
      };
      fixtures = new Fixtures(coreInstance);
      fixtures.getCollection({}, resMock);
      expect(resMock.send.getCall(0).args[0]).toEqual([
        {
          id: "foo-id",
          requestMatchId: "request-match-id",
          handler: undefined,
          request: "foo-request",
          response: "foo-response",
        },
        {
          id: "foo-id-2",
          requestMatchId: "request-match-id-2",
          handler: undefined,
          request: "foo-request-2",
          response: "foo-response-2",
        },
      ]);
    });
  });

  describe("getModel router", () => {
    it("should return the requested fixture model parsed", () => {
      coreInstance.fixtures = {
        collection: [
          {
            id: "foo-id",
            requestMatchId: "request-match-id",
            request: "foo-request",
            response: "foo-response",
          },
          {
            id: "foo-id-2",
            requestMatchId: "request-match-id-2",
            request: "foo-request-2",
            response: "foo-response-2",
          },
        ],
      };
      fixtures = new Fixtures(coreInstance);
      fixtures.getModel(
        {
          params: {
            id: "foo-id",
          },
        },
        resMock
      );
      expect(resMock.send.getCall(0).args[0]).toEqual({
        id: "foo-id",
        requestMatchId: "request-match-id",
        handler: undefined,
        request: "foo-request",
        response: "foo-response",
      });
    });

    it("should return a not found error if fixture is not found", () => {
      const nextStub = sandbox.stub();
      sandbox.stub(Boom, "notFound").returns("foo-error");
      coreInstance.fixtures = {
        collection: [
          {
            id: "foo-id",
            requestMatchId: "request-match-id",
            request: "foo-request",
            response: "foo-response",
          },
        ],
      };
      fixtures = new Fixtures(coreInstance);
      fixtures.getModel(
        {
          params: {
            id: "foo3",
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
      expect(fixtures.router).toEqual(libMocks.stubs.express);
    });
  });
});
