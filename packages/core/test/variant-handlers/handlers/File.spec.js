/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("../../Core.mocks.js");
const File = require("../../../src/variant-handlers/handlers/File");

describe("File variant handler", () => {
  const FOO_VARIANT = {
    status: 200,
    path: "foo-path",
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
        sendFile: sandbox.stub(),
      },
      next: sandbox.stub(),
    };
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    routesHandler = new File(FOO_VARIANT, coreInstance);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("id", () => {
    it("should have file value", () => {
      expect(File.id).toEqual("file");
    });
  });

  describe("version", () => {
    it("should have 4 value", () => {
      expect(File.version).toEqual("4");
    });
  });

  describe("validationSchema", () => {
    it("should be defined", () => {
      expect(File.validationSchema).toBeDefined();
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
    it("should return response status and send response using file path", () => {
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.status.getCall(0).args[0]).toEqual(FOO_VARIANT.status);
      expect(expressStubs.res.sendFile.getCall(0).args[0]).toEqual(FOO_VARIANT.path);
    });

    it("should add headers if they are defined", () => {
      const FOO_HEADERS = { foo: "foo" };
      routesHandler = new File({ ...FOO_VARIANT, headers: FOO_HEADERS }, coreInstance);
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expect(expressStubs.res.set.getCall(0).args[0]).toEqual(FOO_HEADERS);
    });

    it("should do nothing more if no error happens", () => {
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expressStubs.res.sendFile.getCall(0).args[2]();
      expect(expressStubs.next.callCount).toEqual(0);
    });

    it("should call to next passing the error if it happens", () => {
      const error = new Error();
      routesHandler.middleware(expressStubs.req, expressStubs.res, expressStubs.next);
      expressStubs.res.sendFile.getCall(0).args[2](error);
      expect(expressStubs.next.getCall(0).args[0]).toEqual(error);
    });
  });
});
