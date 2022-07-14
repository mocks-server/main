/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { Logger } = require("@mocks-server/logger");

const CoreMocks = require("../../../Core.mocks.js");
const DefaultRoutesHandler = require("../../../../src/mock/variant-handlers/handlers/Default");

describe("Default variant handler", () => {
  const FOO_ROUTE = {
    variantId: "foo-id",
    method: "POST",
    url: "foo-url",
    response: {
      status: 200,
      body: {},
    },
  };
  let sandbox;
  let coreMocks;
  let coreInstance;
  let defaultRoutesHandler;
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
    defaultRoutesHandler = new DefaultRoutesHandler(FOO_ROUTE, coreInstance, {
      logger: new Logger(),
    });
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("id", () => {
    it("should have default value", () => {
      expect(DefaultRoutesHandler.id).toEqual("default");
    });
  });

  describe("plainResponsePreview", () => {
    it("should return response body and status", () => {
      expect(defaultRoutesHandler.plainResponsePreview).toEqual({
        body: {},
        status: 200,
      });
    });

    it("should return function if response is a function", () => {
      defaultRoutesHandler = new DefaultRoutesHandler(
        {
          ...FOO_ROUTE,
          response: () => {
            // do nothing
          },
        },
        coreInstance,
        {
          logger: new Logger(),
        }
      );
      expect(defaultRoutesHandler.plainResponsePreview).toEqual(null);
    });
  });

  describe("middleware", () => {
    it("should return response body and status", () => {
      defaultRoutesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.status.getCall(0).args[0]).toEqual(FOO_ROUTE.response.status);
      expect(expressStubs.res.send.getCall(0).args[0]).toEqual(FOO_ROUTE.response.body);
    });

    it("should add headers if they are defined in response", () => {
      const FOO_HEADERS = { foo: "foo" };
      defaultRoutesHandler = new DefaultRoutesHandler(
        { ...FOO_ROUTE, response: { ...FOO_ROUTE.response, headers: FOO_HEADERS } },
        coreInstance,
        {
          logger: new Logger(),
        }
      );
      defaultRoutesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.set.getCall(0).args[0]).toEqual(FOO_HEADERS);
    });

    it("should execute response if it is a function", () => {
      const fooResponseMethod = sandbox.stub();
      defaultRoutesHandler = new DefaultRoutesHandler(
        { ...FOO_ROUTE, response: fooResponseMethod },
        coreInstance,
        {
          logger: new Logger(),
        }
      );
      defaultRoutesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(fooResponseMethod.getCall(0).args[0]).toEqual(expressStubs.req);
      expect(fooResponseMethod.getCall(0).args[1]).toEqual(expressStubs.res);
      expect(fooResponseMethod.getCall(0).args[2]).toEqual(expressStubs.next);
      expect(fooResponseMethod.getCall(0).args[3]).toEqual(coreInstance);
    });

    it("should return null in plainResponsePreview if response is a function", () => {
      defaultRoutesHandler = new DefaultRoutesHandler(
        {
          ...FOO_ROUTE,
          response: () => {
            // do nothing
          },
        },
        coreInstance,
        {
          logger: new Logger(),
        }
      );
      expect(defaultRoutesHandler.plainResponsePreview).toEqual(null);
    });
  });
});
