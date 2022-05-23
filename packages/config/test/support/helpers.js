const Config = require("../../src/Config");

const cosmiconfig = require("cosmiconfig");
const commander = require("commander");
const sinon = require("sinon");

function createConfigBeforeElements({ createNamespace = false } = {}) {
  let config, namespace, parentNamespace, option;
  const sandbox = sinon.createSandbox();
  const cosmiconfigStub = {
    search: sandbox.stub(),
  };

  sandbox.stub(cosmiconfig, "cosmiconfig").returns(cosmiconfigStub);

  sandbox.stub(commander.Option.prototype, "argParser");
  sandbox.stub(commander.Command.prototype, "addOption");
  sandbox.stub(commander.Command.prototype, "allowUnknownOption");
  sandbox.stub(commander.Command.prototype, "parse");
  sandbox.stub(commander.Command.prototype, "opts").returns({});

  const createConfig = function (options) {
    config = new Config(options);

    if (createNamespace) {
      parentNamespace = config.addNamespace("parentNamespace");
      namespace = parentNamespace.addNamespace("fooNamespace");
    } else {
      namespace = config.addNamespace("fooNamespace");
    }

    option = namespace.addOption({
      name: "fooOption",
      type: "string",
      default: "default-str",
    });
    return {
      config,
      parentNamespace,
      namespace,
      option,
    };
  };
  return {
    sandbox,
    config,
    namespace,
    parentNamespace,
    option,
    createConfig,
    cosmiconfigStub,
  };
}

function wait(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

module.exports = {
  createConfigBeforeElements,
  wait,
};
