const { isUndefined } = require("lodash");
const commander = require("commander");

const { types, getOptionParserWithArrayContents } = require("./types");
const { namespaceAndParentNames } = require("./namespaces");

const NAMESPACE_SEPARATOR = ".";
const COMMANDER_VALUE_GETTER = ` <value>`;
const COMMANDER_ARRAY_VALUE_GETTER = ` <value...>`;

function getOptionPrefix({ isBoolean, defaultIsTrue }) {
  return isBoolean && defaultIsTrue ? "--no-" : "--";
}

function getOptionGetter({ isBoolean, isArray }) {
  if (isBoolean) {
    return "";
  }
  if (isArray) {
    return COMMANDER_ARRAY_VALUE_GETTER;
  }
  return COMMANDER_VALUE_GETTER;
}

function getCommanderOptionProperties(commanderOptionName, option) {
  const isBoolean = option.type === types.BOOLEAN;
  const isArray = option.type === types.ARRAY;
  const defaultIsTrue = option.default === true;
  // Option can only be set to false if default value is true or viceversa. So, users can't restore to default value using args when config in other places change it
  const optionPrefix = getOptionPrefix({ isBoolean, defaultIsTrue });
  const optionValueGetter = getOptionGetter({ isBoolean, isArray });

  const Option = new commander.Option(`${optionPrefix}${commanderOptionName}${optionValueGetter}`);

  return {
    default: option.default,
    isBoolean,
    isObject: option.type === types.OBJECT,
    Option: Option,
  };
}

function getCommanderOptionName(namespace, optionName) {
  return [...namespaceAndParentNames(namespace), optionName].join(NAMESPACE_SEPARATOR);
}

function commanderValueHasToBeIgnored(optionValue, commanderOptionProperties) {
  return (
    !commanderOptionProperties ||
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

  _createNamespaceOptions(namespace, program, optionsData) {
    namespace.options.forEach((option) => {
      const commanderOptionName = getCommanderOptionName(namespace, option.name);
      const commanderOptionProperties = getCommanderOptionProperties(commanderOptionName, option);
      optionsData[commanderOptionName] = {
        namespace,
        option,
        ...commanderOptionProperties,
      };
      program.addOption(commanderOptionProperties.Option);
    });
    this._createNamespacesOptions(namespace.namespaces, program, optionsData);
  }

  _createNamespacesOptions(namespaces, program, optionsData) {
    namespaces.forEach((namespace) => {
      this._createNamespaceOptions(namespace, program, optionsData);
    });
  }

  _addLevelsToConfig(config, levels, index = 0) {
    if (index === levels.length) {
      return config;
    }
    config[levels[index]] = config[levels[index]] || {};
    return this._addLevelsToConfig(config[levels[index]], levels, index + 1);
  }

  _commanderResultsToConfigObject(results, config, commanderOptionsData) {
    Object.keys(results).forEach((optionName) => {
      const optionValue = results[optionName];
      if (!commanderValueHasToBeIgnored(optionValue, commanderOptionsData[optionName])) {
        const objectLevels = optionName.split(NAMESPACE_SEPARATOR).slice(0, -1);
        const option = commanderOptionsData[optionName].option;
        const configAtLevel = this._addLevelsToConfig(config, objectLevels);
        const originalOptionName = option.name;
        const parser = getOptionParserWithArrayContents(option);
        configAtLevel[originalOptionName] = parser(optionValue);
      }
    });
    return config;
  }

  read(namespaces, { allowUnknownOption }) {
    const config = {};

    // Create commander options
    const commanderOptionsData = {};
    const program = new commander.Command();
    this._createNamespacesOptions(namespaces, program, commanderOptionsData);

    // Get commander results
    if (allowUnknownOption) {
      program.allowUnknownOption();
    }

    program.parse();
    const results = program.opts();

    // Convert commander results into object with namespaces levels
    this._config = this._commanderResultsToConfigObject(results, config, commanderOptionsData);

    return this._config;
  }
}

module.exports = CommandLineArguments;
