/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const OptionsMocks = require("./Options.mocks.js");
const CoreMocks = require("../Core.mocks.js");
const ConfigMocks = require("../Config.mocks.js");

const Settings = require("../../src/settings/Settings");
const tracer = require("../../src/tracer");

describe("Settings", () => {
  let optionsMocks;
  let optionsInstance;
  let coreMocks;
  let coreInstance;
  let configMocks;
  let sandbox;
  let settings;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    optionsMocks = new OptionsMocks();
    optionsInstance = optionsMocks.stubs.instance;
    optionsInstance.checkValidOptionName.callsFake((name) => name);
    coreMocks = new CoreMocks();
    configMocks = new ConfigMocks();
    coreInstance = coreMocks.stubs.instance;
    sandbox.stub(tracer, "set");
    sandbox.stub(tracer, "info");
    settings = new Settings(coreInstance._eventEmitter, configMocks.stubs.instance);
    await settings.init();
  });

  afterEach(() => {
    sandbox.restore();
    optionsMocks.restore();
    coreMocks.restore();
    configMocks.restore();
  });

  describe("when initializated", () => {
    it("should init options", () => {
      expect(optionsInstance.init.callCount).toEqual(1);
    });

    it("should set current tracer level", () => {
      expect(tracer.set.calledWith("foo-log-level")).toEqual(true);
    });
  });

  describe("get method", () => {
    it("should return current option value", () => {
      expect(settings.get("log")).toEqual("foo-log-level");
    });

    it("should return current deprecated option value", () => {
      optionsInstance.checkValidOptionName.returns("behavior");
      expect(settings.get("log")).toEqual("foo-behavior");
    });

    it("should return new value if set is called", () => {
      settings.set("log", "foo-new-value");
      expect(settings.get("log")).toEqual("foo-new-value");
    });
  });

  describe("set method", () => {
    it("should set log level if setting is log", () => {
      settings.set("log", "foo-new-value");
      expect(tracer.set.calledWith("foo-new-value")).toEqual(true);
    });

    it("should set new option if provided one is deprecated", () => {
      optionsInstance.checkValidOptionName.returns("behavior");
      settings.set("log", "foo");
      expect(settings.get("behavior")).toEqual("foo");
    });

    it("should emit change if setting has changed value", () => {
      settings.set("foo", "foo-new-value");
      expect(
        coreInstance._eventEmitter.emit.calledWith("change:settings", {
          foo: "foo-new-value",
        })
      ).toEqual(true);
    });

    it("should not emit change if setting maintains value", () => {
      const setFoo = () => {
        settings.set("foo", "foo-new-value");
      };
      setFoo();
      setFoo();
      setFoo();
      expect(coreInstance._eventEmitter.emit.callCount).toEqual(1);
    });
  });

  describe("getValidOptionName method", () => {
    it("should return the result of getValidOptionName options method", () => {
      optionsInstance.getValidOptionName.returns("foo");
      expect(settings.getValidOptionName("behavior")).toEqual("foo");
    });
  });

  describe("all getter", () => {
    it("should return all current settings", () => {
      expect(settings.all).toEqual({
        log: "foo-log-level",
        behavior: "foo-behavior",
      });
    });

    it("should change when set is called", () => {
      settings.set("log", "foo-new-value");
      expect(settings.all.log).toEqual("foo-new-value");
    });
  });

  describe("addCustom method", () => {
    it("should pass custom option to options Class", () => {
      const fooOption = {
        foo: "foo",
      };
      settings.addCustom(fooOption);
      expect(optionsInstance.addCustom.calledWith(fooOption)).toEqual(true);
    });
  });
});
