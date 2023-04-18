/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const LibsMocks = require("../../common/Libs.mocks");
const CoreMocks = require("../../Core.mocks.js");

const { VariantHandlerStatic } = require("../../../../src/variant-handlers/handlers/Static");

describe("Static variant handler", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;
  let routesHandler;
  let libsMocks;
  let expressStubs;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    expressStubs = {
      res: {
        set: sandbox.stub(),
      },
    };
    libsMocks = new LibsMocks();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    libsMocks.stubs.express.static.callsFake((path, options) => {
      return {
        path,
        options,
      };
    });
    routesHandler = new VariantHandlerStatic({}, coreInstance);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
    libsMocks.restore();
  });

  describe("id", () => {
    it("should have static value", () => {
      expect(VariantHandlerStatic.id).toEqual("static");
    });
  });

  describe("validationSchema", () => {
    it("should be defined", () => {
      expect(VariantHandlerStatic.validationSchema).toBeDefined();
    });
  });

  describe("preview", () => {
    it("should be null", () => {
      expect(routesHandler.preview).toEqual(null);
    });
  });

  describe("router", () => {
    it("should pass path option to express static", () => {
      const handler = new VariantHandlerStatic({ path: "foo-path" }, coreInstance);
      const router = handler.router;
      expect(router.path).toEqual("foo-path");
    });

    it("should add headers from object in options when defined", () => {
      const handler = new VariantHandlerStatic({ headers: { foo: "foo" } }, coreInstance);
      const router = handler.router;
      const staticOptions = router.options;
      staticOptions.setHeaders(expressStubs.res);
      expect(expressStubs.res.set.getCall(0).args[0]).toEqual({ foo: "foo" });
    });

    it("should add headers from express setHeaders option when defined", () => {
      const handler = new VariantHandlerStatic(
        { options: { setHeaders: "foo-method" } },
        coreInstance
      );
      const router = handler.router;
      const staticOptions = router.options;
      expect(staticOptions.setHeaders).toEqual("foo-method");
    });
  });
});
