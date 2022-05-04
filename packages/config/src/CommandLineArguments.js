const { isUndefined, compact } = require("lodash");
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
    isObject: option.type === types.OBJECT,
    Option: new commander.Option(
      `${optionPrefix}${commanderOptionName}${optionValueGetter}`
    ).argParser(argParser),
  };
}

function getCommanderOptionName(scopes) {
  return compact(scopes).join(".");
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

  read(groups) {
    this._config = {};
    const commanderOptionsMap = {};

    // Create commander options
    const program = new commander.Command();
    groups.forEach((group) => {
      group.namespaces.forEach((namespace) => {
        namespace.options.forEach((option) => {
          const commanderOptionName = getCommanderOptionName([
            group.name,
            namespace.name,
            option.name,
          ]);
          const commanderOptionProperties = getCommanderOptionProperties(
            commanderOptionName,
            option
          );
          commanderOptionsMap[commanderOptionName] = {
            group: group.name,
            namespace: namespace.name,
            option: option.name,
            ...commanderOptionProperties,
          };
          program.addOption(commanderOptionProperties.Option);
        });
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
        const groupName = commanderOptionsMap[optionName].group;
        const namespaceName = commanderOptionsMap[optionName].namespace;
        const originalOptionName = commanderOptionsMap[optionName].option;
        let groupConfig = this._config;
        if (groupName) {
          this._config[groupName] = this._config[groupName] || {};
          groupConfig = this._config[groupName];
        }
        groupConfig[namespaceName] = groupConfig[namespaceName] || {};
        groupConfig[namespaceName][originalOptionName] = optionValue;
      }
    });
    return this._config;
  }
}

module.exports = CommandLineArguments;
