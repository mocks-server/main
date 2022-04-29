/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const commander = require("commander");

const CommandLineArguments = require("../../legacy/CommandLineArguments");

describe("command line arguments", () => {
  const DEFAULT_OPTIONS = {
    delay: 0,
    host: "0.0.0.0",
    port: 3100,
    log: "info",
    cors: true,
    corsPreFlight: true,
  };
  let sandbox;
  let optionStub;
  let parseStub;
  let commandLineArguments;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    optionStub = sandbox.stub();
    parseStub = sandbox.stub().returns({});
    sandbox.spy(console, "warn");

    optionStub.returns({
      option: optionStub,
      parse: parseStub,
    });

    sandbox.stub(commander, "option").returns({
      option: optionStub,
    });

    commandLineArguments = new CommandLineArguments(DEFAULT_OPTIONS);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("init method", () => {
    it("should call to commander to get user options from command line", async () => {
      await commandLineArguments.init();
      expect(optionStub.callCount).toEqual(6); //First call is not registered
    });

    it("should call to convert to number received value in --port option", async () => {
      expect.assertions(1);
      optionStub.callsFake((commandName, _description, parser) => {
        if (commandName.includes("--port")) {
          expect(parser("5")).toEqual(5);
        }
        return {
          option: optionStub,
          parse: parseStub,
        };
      });
      commandLineArguments = new CommandLineArguments({});
      await commandLineArguments.init();
    });

    it("should omit undefined values", async () => {
      const options = {
        port: 3300,
        path: undefined,
      };
      parseStub.returns(options);
      await commandLineArguments.init();
      expect(commandLineArguments.options).toEqual({
        port: 3300,
      });
    });
  });

  describe("when adding custom option", () => {
    describe("when it is string type", () => {
      it("should add commander option with mandatory value", async () => {
        expect.assertions(2);
        const option = {
          name: "foo",
          description: "foo description",
          type: "string",
        };
        optionStub.callsFake((commandName, description) => {
          if (commandName.includes("--foo")) {
            expect(commandName).toEqual("--foo <foo>");
            expect(description).toEqual(option.description);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });

      it("should use provided custom parser", async () => {
        expect.assertions(1);
        const option = {
          name: "foo",
          type: "string",
          parse: () => {
            // do nothing
          },
        };
        optionStub.callsFake((commandName, _description, parser) => {
          if (commandName.includes("--foo")) {
            expect(parser).toEqual(option.parse);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });
    });

    describe("when type is boolean", () => {
      it("should not add commander option with mandatory value", async () => {
        expect.assertions(2);
        const option = {
          name: "foo",
          description: "foo description",
          type: "boolean",
        };
        optionStub.callsFake((commandName, description) => {
          if (commandName.includes("--foo")) {
            expect(commandName).toEqual("--foo");
            expect(description).toEqual(option.description);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });

      it("should add commander --no prefix if default value is true", async () => {
        expect.assertions(2);
        const option = {
          name: "foo",
          description: "foo description",
          type: "boolean",
          default: true,
        };
        optionStub.callsFake((commandName, description) => {
          if (commandName.includes("-foo")) {
            expect(commandName).toEqual("--no-foo");
            expect(description).toEqual(option.description);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });

      it("should not return the option value if default value is true and commander returns true", async () => {
        expect.assertions(1);
        const option = {
          name: "foo",
          description: "foo description",
          type: "boolean",
          default: true,
        };
        commandLineArguments.addCustom(option);
        parseStub.returns({
          foo: true,
        });
        await commandLineArguments.init();
        expect(commandLineArguments.options.foo).toBeUndefined();
      });

      it("should return the option value if default value is true and commander returns false", async () => {
        expect.assertions(1);
        const option = {
          name: "foo",
          description: "foo description",
          type: "boolean",
          default: true,
        };
        commandLineArguments.addCustom(option);
        parseStub.returns({
          foo: false,
        });
        await commandLineArguments.init();
        expect(commandLineArguments.options.foo).toEqual(false);
      });
    });

    describe("when type is number", () => {
      it("should add commander option with mandatory value", async () => {
        expect.assertions(2);
        const option = {
          name: "foo",
          description: "foo description",
          type: "number",
        };
        optionStub.callsFake((commandName, description) => {
          if (commandName.includes("--foo")) {
            expect(commandName).toEqual("--foo <foo>");
            expect(description).toEqual(option.description);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });

      it("should convert string to number when parsed", async () => {
        expect.assertions(1);
        const option = {
          name: "foo",
          description: "foo description",
          type: "number",
        };
        optionStub.callsFake((commandName, _description, parser) => {
          if (commandName.includes("--foo")) {
            expect(parser("4")).toEqual(4);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });

      it("should use custom parser if provided to get value", async () => {
        expect.assertions(2);
        const option = {
          name: "foo",
          description: "foo description",
          type: "number",
          parse: (val) => val,
        };
        sandbox.spy(option, "parse");
        optionStub.callsFake((commandName, _description, parser) => {
          if (commandName.includes("--foo")) {
            expect(parser("5")).toEqual("5");
            expect(option.parse.callCount).toEqual(1);
          }
          return {
            option: optionStub,
            parse: parseStub,
          };
        });
        commandLineArguments.addCustom(option);
        await commandLineArguments.init();
      });
    });
  });
});
