/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CommandLineArgumentsMocks = require("./CommandLineArguments.mocks.js");

const Options = require("../../../../lib/core/settings/Options");
const tracer = require("../../../../lib/core/tracer");

describe("options", () => {
  let sandbox;
  let options;
  let commandLineArgumentsMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "warn");
    sandbox.stub(tracer, "error");
    commandLineArgumentsMocks = new CommandLineArgumentsMocks();
    options = new Options();
  });

  afterEach(() => {
    sandbox.restore();
    commandLineArgumentsMocks.restore();
  });

  describe("init method", () => {
    it("should call to get command line arguments", async () => {
      await options.init();
      expect(commandLineArgumentsMocks.stubs.instance.init.callCount).toEqual(1);
    });

    it("should print a warning if --feature option is received", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        feature: "foo-feature",
        cli: true,
        behaviors: "foo/features/path"
      };
      await options.init();
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning: --feature")
      );
    });

    it("should print a warning if --features option is received", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        cli: true,
        features: "foo/features/path"
      };
      await options.init();
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning: --features")
      );
    });
  });

  describe("options getter", () => {
    it("should only get values from keys defined in default values", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        behavior: "foo-behavior",
        cli: true,
        behaviors: "foo/behaviors/path",
        foo: undefined,
        foo2: "foooo"
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-behavior",
        behaviors: "foo/behaviors/path"
      });
    });

    it("should get values from keys defined in new options", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        behavior: "foo-behavior",
        cli: true,
        behaviors: "foo/behaviors/path",
        foo: "foo"
      };
      options.addCustom({
        name: "cli",
        type: "boolean"
      });
      options.addCustom({
        name: "foo",
        type: "string"
      });
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        cli: true,
        foo: "foo",
        delay: 0,
        watch: true,
        behavior: "foo-behavior",
        behaviors: "foo/behaviors/path"
      });
    });

    it("should extend default options with user options, ommiting undefined values", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        behavior: "foo-behavior",
        cli: true,
        behaviors: "foo/behaviors/path",
        foo: undefined
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-behavior",
        behaviors: "foo/behaviors/path"
      });
    });

    it("should convert feature and features options to behavior and behaviors", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        feature: "foo-feature",
        cli: true,
        features: "foo/features/path"
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-feature",
        behaviors: "foo/features/path"
      });
    });

    it("should apply behavior and behavior options if feature and features options are received too", async () => {
      commandLineArgumentsMocks.stubs.instance.options = {
        behavior: "foo-behavior",
        feature: "foo-feature",
        cli: true,
        behaviors: "foo/behaviors/path",
        features: "foo-feature"
      };
      await options.init();
      expect(options.options).toEqual({
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-behavior",
        behaviors: "foo/behaviors/path"
      });
    });
  });
});
