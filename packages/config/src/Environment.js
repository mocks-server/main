const { isUndefined, snakeCase } = require("lodash");

const { getOptionParserIncludingBooleans } = require("./types");

function varSegment(segment) {
  return snakeCase(segment).toUpperCase();
}

function envVarName(moduleName, namespaceName, optionName) {
  return `${varSegment(moduleName)}_${varSegment(namespaceName)}_${varSegment(optionName)}`;
}

class Environment {
  constructor(moduleName) {
    this._moduleName = moduleName;
    this._config = {};
  }

  loadFromEnv(namespaceName, optionName) {
    return process.env[envVarName(this._moduleName, namespaceName, optionName)];
  }

  read(namespaces) {
    this._config = {};
    namespaces.forEach((namespace) => {
      namespace.options.forEach((option) => {
        const value = this.loadFromEnv(namespace.name, option.name);
        if (!isUndefined(value)) {
          this._config[namespace.name] = this._config[namespace.name] || {};
          const parser = getOptionParserIncludingBooleans(option);
          this._config[namespace.name][option.name] = parser(value);
        }
      });
    });
    return this._config;
  }
}

module.exports = Environment;
