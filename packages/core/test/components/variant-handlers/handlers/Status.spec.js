/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("../../Core.mocks.js");
const { VariantHandlerStatus } = require("../../../../src/variant-handlers/handlers/Status");

describe("Status variant handler", () => {
  const FOO_VARIANT = {
    status: 200,
  };
  let sandbox;
  let coreMocks;
  let coreInstance;
  let routesHandler;
  let expressStubs;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    expressStubs = {
      req: {
        id: "foo-request-id",
      },
      res: {
        status: sandbox.stub(),
        send: sandbox.stub(),
        set: sandbox.stub(),
      },
      next: sandbox.stub(),
    };
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    routesHandler = new VariantHandlerStatus(FOO_VARIANT, coreInstance);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("id", () => {
    it("should have status value", () => {
      expect(VariantHandlerStatus.id).toEqual("status");
    });
  });

  describe("validationSchema", () => {
    it("should be defined", () => {
      expect(VariantHandlerStatus.validationSchema).toBeDefined();
    });
  });

  describe("preview", () => {
    it("should return response status", () => {
      expect(routesHandler.preview).toEqual({
        status: 200,
      });
    });
  });

  describe("middleware", () => {
    it("should return response status", () => {
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.status.getCall(0).args[0]).toEqual(FOO_VARIANT.status);
      expect(expressStubs.res.send.getCall(0).args[0]).toEqual(undefined);
    });

    it("should add default headers to response", () => {
      const FOO_HEADERS = { "Content-Length": "0" };
      routesHandler = new VariantHandlerStatus({ ...FOO_VARIANT }, coreInstance);
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.set.getCall(0).args[0]).toEqual(FOO_HEADERS);
    });

    it("should add headers to default headers if they are defined in response", () => {
      const FOO_HEADERS = { foo: "foo" };
      routesHandler = new VariantHandlerStatus(
        { ...FOO_VARIANT, headers: FOO_HEADERS },
        coreInstance
      );
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.set.getCall(0).args[0]).toEqual({
        "Content-Length": "0",
        foo: "foo",
      });
    });
  });
});
