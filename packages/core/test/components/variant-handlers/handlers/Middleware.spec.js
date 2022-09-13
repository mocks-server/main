/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("../../Core.mocks.js");
const Middleware = require("../../../../src/variant-handlers/handlers/Middleware");

describe("Middleware variant handler", () => {
  const FOO_VARIANT = {
    middleware: () => {
      // do nothing
    },
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
    routesHandler = new Middleware(FOO_VARIANT, coreInstance);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("id", () => {
    it("should have middleware value", () => {
      expect(Middleware.id).toEqual("middleware");
    });
  });

  describe("validationSchema", () => {
    it("should be defined", () => {
      expect(Middleware.validationSchema).toBeDefined();
    });
  });

  describe("preview", () => {
    it("should return null", () => {
      expect(routesHandler.preview).toEqual(null);
    });
  });

  describe("middleware", () => {
    it("should execute middleware function", () => {
      const fooResponseMethod = sandbox.stub();
      routesHandler = new Middleware(
        { ...FOO_VARIANT, middleware: fooResponseMethod },
        coreInstance
      );
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(fooResponseMethod.getCall(0).args[0]).toEqual(expressStubs.req);
      expect(fooResponseMethod.getCall(0).args[1]).toEqual(expressStubs.res);
      expect(fooResponseMethod.getCall(0).args[2]).toEqual(expressStubs.next);
      expect(fooResponseMethod.getCall(0).args[3]).toEqual(coreInstance);
    });
  });
});
