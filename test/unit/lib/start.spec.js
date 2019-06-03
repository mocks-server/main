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

    describe("when cli throws an error", () => {
      it("should trace the error message if it is a Boom error", async () => {
        expect.assertions(1);
        const fooErrorMessage = "foo error message";
        const fooError = Boom.badImplementation(fooErrorMessage);
        cliMocks.stubs.instance.start.rejects(fooError);
        try {
          await start();
        } catch (err) {
          expect(tracer.error.getCall(0).args[0]).toEqual(fooErrorMessage);
        }
      });

      it("should print the error if it is not a Boom error", async () => {
        expect.assertions(1);
        sandbox.stub(console, "log");
        const fooError = new Error();
        cliMocks.stubs.instance.start.rejects(fooError);
        try {
          await start();
        } catch (err) {
          expect(console.log.getCall(0).args[0]).toEqual(fooError);
        }
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
