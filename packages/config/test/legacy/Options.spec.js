/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CommandLineArgumentsMocks = require("./CommandLineArguments.mocks.js");
const ConfigMocks = require("./Config.mocks.js");

const Options = require("../../legacy/Options");

describe("options", () => {
  let sandbox;
  let options;
  let commandLineArgumentsMocks;
  let configMocks;
  let tracer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    tracer = {
      debug: sandbox.stub(),
      set: sandbox.stub(),
      info: sandbox.stub(),
      error: sandbox.stub(),
      deprecationWarn: sandbox.stub(),
      warn: sandbox.stub(),
    };
    commandLineArgumentsMocks = new CommandLineArgumentsMocks();
    configMocks = new ConfigMocks();
    options = new Options(configMocks.stubs.instance, tracer);
  });

  afterEach(() => {
    sandbox.restore();
    configMocks.restore();
    configMocks.stubs.instance.coreOptions = {};
    configMocks.stubs.instance.options = {};
    commandLineArgumentsMocks.restore();
  });

  describe("init method", () => {
    it("should call to get command line arguments", async () => {
      await options.init();
      expect(commandLineArgumentsMocks.stubs.instance.init.callCount).toEqual(1);
    });

    it("should call only once to get command line arguments", async () => {
      await options.init();
      await options.init();
      await options.init();
      expect(commandLineArgumentsMocks.stubs.instance.init.callCount).toEqual(1);
    });
  });

  describe("init method when command line arguments are disabled", () => {
    it("should not call to get command line arguments", async () => {
      configMocks.stubs.instance.coreOptions.disableCommandLineArguments = true;
      options = new Options(configMocks.stubs.instance);
      await options.init();
      expect(commandLineArgumentsMocks.stubs.instance.init.callCount).toEqual(0);
    });
  });

  describe("when adding custom option", () => {
    it("should trow an error if options have been already initialized", async () => {
      expect.assertions(2);
      await options.init();
      try {
        options.addCustom();
      } catch (error) {
        const errorMessageContains = "already initializated";
        expect(tracer.error.getCall(0).args[0]).toEqual(
          expect.stringContaining(errorMessageContains)
        );
        expect(error.message).toEqual(expect.stringContaining(errorMessageContains));
      }
    });

    it("should trow an error if no option is provided", () => {
      expect.assertions(2);
      try {
        options.addCustom();
      } catch (error) {
        const errorMessageContains = "provide option details";
        expect(tracer.error.getCall(0).args[0]).toEqual(
          expect.stringContaining(errorMessageContains)
        );
        expect(error.message).toEqual(expect.stringContaining(errorMessageContains));
      }
    });

    it("should trow an error if option name is not provided", () => {
      expect.assertions(2);
      try {
        options.addCustom({
          description: "foo",
        });
      } catch (error) {
        const errorMessageContains = "provide option name";
        expect(tracer.error.getCall(0).args[0]).toEqual(
          expect.stringContaining(errorMessageContains)
        );
        expect(error.message).toEqual(expect.stringContaining(errorMessageContains));
      }
    });

    it("should trow an error if option was already declared", () => {
      expect.assertions(2);
      try {
        options.addCustom({
          name: "mock",
        });
      } catch (error) {
        const errorMessageContains = "already registered";
        expect(tracer.error.getCall(0).args[0]).toEqual(
          expect.stringContaining(errorMessageContains)
        );
        expect(error.message).toEqual(expect.stringContaining(errorMessageContains));
      }
    });

    it("should trow an error if option type is unknown", () => {
      expect.assertions(2);
      try {
        options.addCustom({
          name: "foo",
          type: "foo",
        });
      } catch (error) {
        const errorMessageContains = "provide a valid option type";
        expect(tracer.error.getCall(0).args[0]).toEqual(
          expect.stringContaining(errorMessageContains)
        );
        expect(error.message).toEqual(expect.stringContaining(errorMessageContains));
      }
    });

    it("should print a warning if option description is not provided", () => {
      expect.assertions(1);
      options.addCustom({
        name: "foo",
        type: "string",
      });
      const errorMessageContains = "provide option description";
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining(errorMessageContains)
      );
    });

    it("should not print a warning if option description is not provided", () => {
      expect.assertions(1);
      options.addCustom({
        name: "foo",
        type: "string",
        description: "foo-description",
      });
      expect(tracer.warn.callCount).toEqual(0);
    });
  });

  describe("options getter", () => {
    it("should only get values from keys defined in default values", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        cli: true,
        foo: undefined,
        foo2: "foooo",
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should remove deprecated options", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        cli: true,
        foo: undefined,
        foo2: "foooo",
        recursive: false,
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should get values from keys defined in new options", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        cli: true,
        foo: "foo",
      };
      options.addCustom({
        name: "cli",
        type: "boolean",
      });
      options.addCustom({
        name: "foo",
        type: "string",
      });
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        cli: true,
        foo: "foo",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should return default options", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {};
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should extend default options with user options, ommiting undefined values", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        cli: true,
        foo: undefined,
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });
  });

  describe("options getter when config return options", () => {
    beforeEach(() => {
      configMocks.stubs.instance.disableCommandLineArguments = true;
      options = new Options(configMocks.stubs.instance, tracer);
    });

    it("should only get values from keys defined in default values", async () => {
      configMocks.stubs.instance.options = {
        cli: true,
        foo: undefined,
        foo2: "foooo",
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should remove deprecated options", async () => {
      configMocks.stubs.instance.options = {
        cli: true,
        behaviors: "foo/behaviors/path",
        foo: undefined,
        foo2: "foooo",
        recursive: false,
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should get values from keys defined in new options", async () => {
      options.addCustom({
        name: "cli",
        type: "boolean",
      });
      options.addCustom({
        name: "foo",
        type: "string",
      });
      configMocks.stubs.instance.options = {
        cli: true,
        foo: "foo",
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        cli: true,
        foo: "foo",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });

    it("should extend default options with user options, ommiting undefined values", async () => {
      configMocks.stubs.instance.options = {
        cli: true,
        foo: undefined,
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        cors: true,
        corsPreFlight: true,
        mock: null,
      });
    });
  });

  describe("getValidOptionName method", () => {
    it("should return null if option is not valid", async () => {
      expect.assertions(1);
      await options.init();
      expect(options.getValidOptionName("foo")).toEqual(null);
    });

    it("should return option name if option is valid", async () => {
      await options.init();
      expect(options.getValidOptionName("mock")).toEqual("mock");
    });

    it.skip("should return new option name if option is deprecated", async () => {
      expect.assertions(2);
      await options.init();
      const option = options.getValidOptionName("behaviors");
      expect(tracer.deprecationWarn.calledWith("behaviors option", "path option")).toEqual(true);
      expect(option).toEqual("path");
    });

    it("should return option name if custom option is received", async () => {
      options.addCustom({
        name: "foo",
        type: "boolean",
      });
      await options.init();
      expect(options.getValidOptionName("foo")).toEqual("foo");
    });
  });

  describe("checkValidOptionName method", () => {
    it("should throw an error if option is not valid", async () => {
      expect.assertions(1);
      await options.init();
      try {
        options.checkValidOptionName("foo");
      } catch (error) {
        expect(error.message).toEqual(expect.stringContaining("Not valid option"));
      }
    });

    it("should return option name if option is valid", async () => {
      await options.init();
      expect(options.checkValidOptionName("mock")).toEqual("mock");
    });

    it.skip("should return new option name if option is deprecated", async () => {
      expect.assertions(2);
      await options.init();
      const option = options.checkValidOptionName("feature");
      expect(tracer.deprecationWarn.calledWith("feature option", "behavior option")).toEqual(true);
      expect(option).toEqual("behavior");
    });

    it("should return option name if custom option is received", async () => {
      options.addCustom({
        name: "foo",
        type: "boolean",
      });
      await options.init();
      expect(options.checkValidOptionName("foo")).toEqual("foo");
    });
  });
});
