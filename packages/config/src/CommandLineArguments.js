const { isUndefined } = require("lodash");
const commander = require("commander");

const { types, getOptionParser } = require("./types");

function getCommanderOptionProperties(commanderOptionName, option) {
  const isBoolean = option.type === types.BOOLEAN;
  const defaultIsTrue = option.default === true;
  const optionPrefix = isBoolean && defaultIsTrue ? "--no-" : "--";
  const optionValueGetter = isBoolean ? "" : ` <${commanderOptionName}>`;
  const argParser = getOptionParser(option);

  return {
    default: option.default,
    isBoolean,
    Option: new commander.Option(
      `${optionPrefix}${commanderOptionName}${optionValueGetter}`
    ).argParser(argParser),
  };
}

function getCommanderOptionName(namespaceName, option) {
  return `${namespaceName}.${option}`;
}

function commanderValueHasToBeIgnored(optionValue, commanderOptionProperties) {
  return (
    isUndefined(optionValue) ||
    // Commander assign default true value to boolean options. We can't assign default values, because arguments would overwrite variables defined using other methods, such as env vars.
    (optionValue === true &&
      commanderOptionProperties.isBoolean &&
      commanderOptionProperties.default === true)
  );
}

class CommandLineArguments {
  constructor() {
    this._config = {};
  }

  read(namespaces) {
    this._config = {};
    const commanderOptionsMap = {};

    // Create commander options
    const program = new commander.Command();
    namespaces.forEach((namespace) => {
      namespace.options.forEach((option) => {
        const commanderOptionName = getCommanderOptionName(namespace.name, option.name);
        const commanderOptionProperties = getCommanderOptionProperties(
          commanderOptionName,
          option
        );
        commanderOptionsMap[commanderOptionName] = {
          namespace: namespace.name,
          option: option.name,
          ...commanderOptionProperties,
        };
        program.addOption(commanderOptionProperties.Option);
      });
    });

    // Get commander results
    program.allowUnknownOption();
    program.parse();
    const results = program.opts();

    // Convert commander results into object in original namespaces
    Object.keys(results).forEach((optionName) => {
      const optionValue = results[optionName];
      if (!commanderValueHasToBeIgnored(optionValue, commanderOptionsMap[optionName])) {
        this._config[commanderOptionsMap[optionName].namespace] =
          this._config[commanderOptionsMap[optionName].namespace] || {};
        this._config[commanderOptionsMap[optionName].namespace][
          commanderOptionsMap[optionName].option
        ] = optionValue;
      }
    });
    return this._config;
  }
}

module.exports = CommandLineArguments;
