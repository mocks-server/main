/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("boom");

const CliMocks = require("./Cli.mocks.js");
const ServerMocks = require("./Server.mocks.js");

const { start } = require("../../../lib/start");
const options = require("../../../lib/common/options");
const tracer = require("../../../lib/common/tracer");

describe("start method", () => {
  let sandbox;
  let cliMocks;
  let serverMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(options, "get").returns({
      cli: true
    });
    sandbox.stub(tracer, "error");
    cliMocks = new CliMocks();
    serverMocks = new ServerMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    cliMocks.restore();
  });

  describe("when cli option is true", () => {
    it("should create a CLI, passing to it the user options", async () => {
      const fooOptions = {
        cli: true
      };
      options.get.returns(fooOptions);
      await start();
      expect(cliMocks.stubs.Constructor.mock.calls[0]).toEqual([fooOptions]);
    });

    it("should call to cli start method", async () => {
      await start();
      expect(cliMocks.stubs.instance.start.callCount).toEqual(1);
    });

    describe("when creating Cli throws an error", () => {
      it("should print the error", async () => {
        sandbox.stub(console, "log");
        const fooErrorMessage = "foo error message";
        cliMocks.stubs.Constructor.mockImplementation(() => {
          throw new Error(fooErrorMessage);
        });
        expect.assertions(1);
        await start();
        expect(console.log.getCall(0).args[0].message).toEqual(fooErrorMessage);
      });
    });

    describe("when creating Server throws an error", () => {
      it("should print the error", async () => {
        const fooOptions = {
          cli: false
        };
        options.get.returns(fooOptions);
        const fooErrorMessage = "foo error message";
        sandbox.stub(console, "log");
        serverMocks.stubs.Constructor.mockImplementation(() => {
          throw new Error(fooErrorMessage);
        });
        expect.assertions(1);
        await start();
        expect(console.log.getCall(0).args[0].message).toEqual(fooErrorMessage);
      });
    });

    describe("when cli throws an error", () => {
      it("should trace the error message if it is a Boom error", async () => {
        expect.assertions(1);
        const fooErrorMessage = "foo error message";
        const fooError = Boom.badImplementation(fooErrorMessage);
        cliMocks.stubs.instance.start.rejects(fooError);
        await start();
        expect(tracer.error.getCall(0).args[0]).toEqual(fooErrorMessage);
      });

      it("should print the error if it is not a Boom error", async () => {
        expect.assertions(1);
        sandbox.stub(console, "log");
        const fooError = new Error();
        cliMocks.stubs.instance.start.rejects(fooError);
        await start();
        expect(console.log.getCall(0).args[0]).toEqual(fooError);
      });
    });

    describe("when cli option is false", () => {
      it("should create a Server, passing to it the user options", async () => {
        const fooOptions = {
          cli: false,
          features: "foo"
        };
        options.get.returns(fooOptions);
        await start();
        expect(serverMocks.stubs.Constructor.mock.calls[0]).toEqual([
          fooOptions.features,
          fooOptions
        ]);
      });
    });
  });
});
