/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("@hapi/boom");

jest.mock("body-parser");

const bodyParser = require("body-parser");

const tracer = require("../../src/tracer");
const middlewares = require("../../src/server/middlewares");

describe("middlewares", () => {
  let sandbox;
  let statusSpy;
  let sendSpy;
  let resMock;
  let nextSpy;
  let headerSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    statusSpy = sandbox.spy();
    sendSpy = sandbox.spy();
    headerSpy = sandbox.spy();
    resMock = {
      status: statusSpy,
      header: headerSpy,
      send: sendSpy,
    };
    nextSpy = sandbox.spy();
    bodyParser.json = sandbox.stub();
    bodyParser.urlencoded = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("traceRequest", () => {
    const fooRequest = {
      method: "foo-method",
      url: "foo-url",
      id: "foo-id",
    };
    let tracerStub;

    beforeEach(() => {
      tracerStub = sandbox.stub(tracer, "verbose");
    });

    it("should call to tracer verbose method, printing the request method", () => {
      middlewares.traceRequest(fooRequest, resMock, nextSpy);
      expect(tracerStub.getCall(0).args[0]).toEqual(expect.stringContaining("foo-method"));
    });

    it("should call to tracer verbose method, printing the request url", () => {
      middlewares.traceRequest(fooRequest, resMock, nextSpy);
      expect(tracerStub.getCall(0).args[0]).toEqual(expect.stringContaining("foo-url"));
    });

    it("should call to tracer verbose method, printing the request id", () => {
      middlewares.traceRequest(fooRequest, resMock, nextSpy);
      expect(tracerStub.getCall(0).args[0]).toEqual(expect.stringContaining("foo-id"));
    });

    it("should call to next callback", () => {
      middlewares.traceRequest(fooRequest, resMock, nextSpy);
      expect(nextSpy.callCount).toEqual(1);
    });
  });

  describe("notFound", () => {
    const fooNotFoundError = new Error("foo");
    const fooRequest = {
      id: "foo-id",
    };
    let tracerStub;

    beforeEach(() => {
      tracerStub = sandbox.stub(tracer, "debug");
      sandbox.stub(Boom, "notFound").returns(fooNotFoundError);
    });

    it("should call to tracer debug method, printing the request id", () => {
      middlewares.notFound(fooRequest, resMock, nextSpy);
      expect(tracerStub.getCall(0).args[0]).toEqual(expect.stringContaining("foo-id"));
    });

    it("should call to next callback, passing a not found error", () => {
      middlewares.notFound(fooRequest, resMock, nextSpy);
      expect(nextSpy.getCall(0).args[0]).toEqual(fooNotFoundError);
    });
  });

  describe("errorHandler", () => {
    const fooError = new Error("foo error message");
    const fooBadImplementationError = new Error("foo bad implementation error message");
    const fooRequest = {
      id: "foo-id",
    };

    beforeEach(() => {
      fooError.output = {
        statusCode: "foo-status-code",
        payload: "foo-payload",
      };
      fooBadImplementationError.output = {
        statusCode: "foo-bad-implementation-status-code",
        payload: "foo-bad-implementation-payload",
      };
      sandbox.stub(tracer, "error");
      sandbox.stub(tracer, "silly");
      sandbox.stub(Boom, "isBoom").returns(false);
      sandbox.stub(Boom, "badImplementation").returns(fooBadImplementationError);
    });

    it("should call to next callback if no error is received", () => {
      middlewares.errorHandler(null, fooRequest, resMock, nextSpy);
      expect(nextSpy.callCount).toEqual(1);
    });

    it("should trace the received error with the request id", () => {
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(tracer.error.getCall(0).args[0]).toEqual(expect.stringContaining("foo-id"));
    });

    it("should convert the received error to a bad implementation error if it is not a Boom error", () => {
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(Boom.badImplementation.getCall(0).args[0]).toEqual(fooError);
    });

    it("should trace the received error message", () => {
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(tracer.error.getCall(0).args[0]).toEqual(
        expect.stringContaining("foo bad implementation error message")
      );
    });

    it("should trace the received error stack", () => {
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(tracer.silly.getCall(0).args[0]).toEqual(fooError.stack.toString());
    });

    it("should call to set response status as error statusCode", () => {
      fooError.stack = null;
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(resMock.status.getCall(0).args[0]).toEqual("foo-bad-implementation-status-code");
    });

    it("should call to send response with error payload", () => {
      fooError.stack = null;
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(resMock.send.getCall(0).args[0]).toEqual("foo-bad-implementation-payload");
    });

    it("should not trace error stack if error is controlled", () => {
      Boom.isBoom.returns(true);
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(tracer.silly.callCount).toEqual(0);
    });

    it("should not convert the received error if it is controlled", () => {
      Boom.isBoom.returns(true);
      middlewares.errorHandler(fooError, fooRequest, resMock, nextSpy);
      expect(Boom.badImplementation.callCount).toEqual(0);
    });
  });

  describe("jsonBodyParser", () => {
    it("should call to json body parser passing options to it", () => {
      middlewares.jsonBodyParser({ foo: "foo" });
      console.log(bodyParser.json.callCount);
      expect(bodyParser.json.getCall(0).args[0]).toEqual({ foo: "foo" });
    });
  });

  describe("urlEncodedBodyParser", () => {
    it("should call to urlencoded body parser passing options to it", () => {
      middlewares.urlEncodedBodyParser({ foo: "foo" });
      expect(bodyParser.urlencoded.getCall(0).args[0]).toEqual({ foo: "foo" });
    });
  });
});
