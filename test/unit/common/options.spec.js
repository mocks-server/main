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

  describe("get method", () => {
    it("should call to commander to get user options from command line", () => {
      options.get();
      expect(optionStub.callCount).toEqual(8);
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
  });
});
