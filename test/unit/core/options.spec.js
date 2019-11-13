/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const commander = require("commander");

const options = require("../../../lib/common/options");

describe("options", () => {
  let sandbox;
  let optionStub;
  let parseStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    optionStub = sandbox.stub();
    parseStub = sandbox.stub().returns({});
    sandbox.spy(console, "warn");

    optionStub.returns({
      option: optionStub,
      parse: parseStub
    });

    sandbox.stub(commander, "option").returns({
      option: optionStub
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("stringToBoolean helper", () => {
    it("should return true if value is 'true'", async () => {
      expect(options.stringToBoolean("true")).toEqual(true);
    });

    it("should return false if value is 'false'", async () => {
      expect(options.stringToBoolean("false")).toEqual(false);
    });

    it("should throw an error if values does not match any of previous", async () => {
      expect.assertions(1);
      try {
        options.stringToBoolean("foo");
      } catch (err) {
        expect(err.message).toEqual("Invalid boolean value");
      }
    });
  });

  describe("get method", () => {
    it("should call to commander to get user options from command line", () => {
      options.get();
      expect(optionStub.callCount).toEqual(10);
    });

    it("should call to convert to number received value in --port option", () => {
      expect.assertions(1);
      optionStub.callsFake((commandName, description, parser) => {
        if (commandName.includes("--port")) {
          expect(parser("5")).toEqual(5);
        }
        return {
          option: optionStub,
          parse: parseStub
        };
      });
      options.get();
    });

    it("should print a warning if --feature option is received", () => {
      parseStub.returns({
        feature: "foo-feature",
        cli: true,
        behaviors: "foo/features/path"
      });
      options.get();
      expect(console.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning: --feature")
      );
    });

    it("should print a warning if --features option is received", () => {
      parseStub.returns({
        cli: true,
        features: "foo/features/path"
      });
      options.get();
      expect(console.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning: --features")
      );
    });

    it("should extend default options with user options, ommiting undefined values", () => {
      parseStub.returns({
        feature: "foo-feature",
        cli: true,
        features: "foo/features/path"
      });
      expect(options.get()).toEqual({
        cli: true,
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        feature: "foo-feature",
        features: "foo/features/path",
        recursive: true
      });
    });

    it("should convert behavior and behavior options to features", () => {
      parseStub.returns({
        behavior: "foo-feature",
        cli: true,
        behaviors: "foo/features/path"
      });
      expect(options.get()).toEqual({
        cli: true,
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-feature",
        behaviors: "foo/features/path",
        feature: "foo-feature",
        features: "foo/features/path",
        recursive: true
      });
    });

    it("should apply behavior and behavior options if feature and features options are received too", () => {
      parseStub.returns({
        behavior: "foo-behavior",
        feature: "foo-feature",
        cli: true,
        behaviors: "foo/behaviors/path",
        features: "foo-feature"
      });
      expect(options.get()).toEqual({
        cli: true,
        port: 3100,
        host: "0.0.0.0",
        log: "info",
        delay: 0,
        watch: true,
        behavior: "foo-behavior",
        behaviors: "foo/behaviors/path",
        feature: "foo-behavior",
        features: "foo/behaviors/path",
        recursive: true
      });
    });
  });
});
