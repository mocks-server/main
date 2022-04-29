const { isUndefined, snakeCase } = require("lodash");

function formatVarSegment(segment) {
  return snakeCase(segment).toUpperCase();
}

function envVarName(moduleName, namespaceName, optionName) {
  return `${formatVarSegment(moduleName)}_${formatVarSegment(namespaceName)}_${formatVarSegment(
    optionName
  )}`;
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
    namespaces.forEach((namespace) => {
      namespace.options.forEach((option) => {
        const value = this.loadFromEnv(namespace.name, option.name);
        if (!isUndefined(value)) {
          this._config[namespace.name] = this._config[namespace.name] || {};
          // TODO, convert boolean values
          this._config[namespace.name][option.name] = value;
        }
      });
    });
    return this._config;
  }
}

module.exports = Environment;
