/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const path = require("path");
const fsExtra = require("fs-extra");

const Config = require("../../src/Config");
const tracer = require("../../src/tracer");

describe("Config", () => {
  let sandbox;
  let config;
  const FIXTURES_FOLDER = path.resolve(__dirname, "fixtures", "config");

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "info");
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "set");
    sandbox.stub(process, "cwd").returns(FIXTURES_FOLDER);
    sandbox.spy(path, "resolve");
    sandbox.spy(fsExtra, "pathExists");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when created", () => {
    it("should init coreOptions as empty object if no received", async () => {
      config = new Config();
      expect(config.coreOptions).toEqual({});
    });

    it("should set disableCommandLineArguments as true if onlyProgrammaticOptions is true", async () => {
      config = new Config({
        onlyProgrammaticOptions: true
      });
      expect(config.coreOptions.disableCommandLineArguments).toEqual(true);
    });

    it("should set disableCommandLineArguments as false if it is explictly defined", async () => {
      config = new Config({
        onlyProgrammaticOptions: true,
        disableCommandLineArguments: false
      });
      expect(config.coreOptions.disableCommandLineArguments).toEqual(false);
    });

    it("should set disableConfigFile as true if onlyProgrammaticOptions is true", async () => {
      config = new Config({
        onlyProgrammaticOptions: true
      });
      expect(config.coreOptions.disableConfigFile).toEqual(true);
    });

    it("should set disableConfigFile as false if it is explictly defined", async () => {
      config = new Config({
        onlyProgrammaticOptions: true,
        disableConfigFile: false
      });
      expect(config.coreOptions.disableConfigFile).toEqual(false);
    });

    it("should set plugins received programmatically", async () => {
      config = new Config({
        plugins: "foo"
      });
      expect(config.coreOptions.plugins).toEqual("foo");
    });

    it("should set plugins received programmatically", async () => {
      config = new Config({
        configFile: "/foo"
      });
      expect(config.coreOptions.configFile).toEqual("/foo");
    });

    it("should set received options", async () => {
      config = new Config({
        options: {
          foo: "foo"
        }
      });
      expect(config.options).toEqual({
        foo: "foo"
      });
    });

    it("should set log level if option log is received", async () => {
      config = new Config({
        options: {
          log: "silly"
        }
      });
      expect(tracer.set.calledWith("silly")).toEqual(true);
    });
  });

  describe("When initialized", () => {
    it("should extend core programmatic options with init method options", async () => {
      config = new Config({
        options: {
          foo: "foo",
          foo2: "foo-2"
        }
      });
      await config.init({
        foo2: "foo2",
        foo3: "foo3"
      });
      expect(config.options).toEqual({
        foo: "foo",
        foo2: "foo2",
        foo3: "foo3"
      });
    });
  });

  describe("When reading config file", () => {
    it("should not try to read config file if disableConfigFile is true", async () => {
      config = new Config({
        disableConfigFile: true
      });
      await config.init();
      expect(fsExtra.pathExists.callCount).toEqual(0);
    });

    it("should try to read file named mocks-server.config.js in cwd by default", async () => {
      config = new Config();
      await config.init();
      expect(fsExtra.pathExists.getCall(0).args[0]).toEqual(
        path.resolve(FIXTURES_FOLDER, "mocks-server.config.js")
      );
    });

    it("should try to read custom file path from cwd if it is relative", async () => {
      config = new Config({
        configFile: "foo-config.js"
      });
      await config.init();
      expect(fsExtra.pathExists.getCall(0).args[0]).toEqual(
        path.resolve(FIXTURES_FOLDER, "foo-config.js")
      );
    });

    it("should try to read custom file path if it is absolute", async () => {
      config = new Config({
        configFile: path.resolve(__dirname, "foo.js")
      });
      await config.init();
      expect(fsExtra.pathExists.getCall(0).args[0]).toEqual(path.resolve(__dirname, "foo.js"));
    });

    it("should trace if configuration file is not found", async () => {
      config = new Config({
        configFile: "foo-config.js"
      });
      await config.init();
      expect(tracer.info.calledWith("Configuration file not found")).toEqual(true);
    });

    it("should extend programmatic, initialization and file options", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.object.js",
        options: {
          foo: "foo",
          foo2: "foo-2"
        }
      });
      await config.init({
        foo2: "foo2",
        foo3: "foo3",
        delay: 500
      });
      expect(config.coreOptions).toEqual({
        configFile: "config.object.js",
        plugins: ["foo"]
      });
      expect(config.options).toEqual({
        foo: "foo",
        foo2: "foo2",
        foo3: "foo3",
        log: "silly",
        delay: 1000
      });
    });

    it("should read configuration when defined as an object", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.object.js"
      });
      await config.init();
      expect(config.coreOptions).toEqual({
        configFile: "config.object.js",
        plugins: ["foo"]
      });
      expect(config.options).toEqual({
        log: "silly",
        delay: 1000
      });
    });

    it("should read configuration when defined as a function", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.function.js"
      });
      await config.init();
      expect(config.coreOptions).toEqual({
        configFile: "config.function.js",
        plugins: ["foo"]
      });
      expect(config.options).toEqual({
        log: "silly",
        delay: 1000
      });
    });

    it("should read configuration when defined as a promise", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.promise.js"
      });
      await config.init();
      expect(config.coreOptions).toEqual({
        configFile: "config.promise.js",
        plugins: ["foo"]
      });
      expect(config.options).toEqual({
        log: "silly",
        delay: 1000
      });
    });

    it("should pass programmatic config to function to allow modify it", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.modify.js",
        disableCommandLineArguments: true,
        plugins: ["foo"],
        options: {
          foo: "foo"
        }
      });
      await config.init({
        foo2: "foo2"
      });
      expect(config.coreOptions).toEqual({
        configFile: "config.modify.js",
        plugins: ["foo", "foo2"]
      });
      expect(config.options).toEqual({
        foo2: "foo2",
        foo3: "foo3"
      });
    });

    it("should trace error when file export a not valid object", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.export-invalid.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });

    it("should trace error when promise returns a not valid object", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.promise-invalid.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });

    it("should trace error when function returns a not valid object", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.function-invalid.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });

    it("should trace error when file throws an error", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.export-error.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });

    it("should trace error when function throws an error", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.function-error.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });

    it("should trace error when promise is rejected", async () => {
      expect.assertions(2);
      config = new Config({
        configFile: "config.promise-rejected.js"
      });
      await config.init();
      expect(tracer.error.calledWith("Error in configuration file")).toEqual(true);
      expect(config.options).toEqual({});
    });
  });
});
