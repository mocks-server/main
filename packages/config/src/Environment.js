const { isUndefined, isEmpty, snakeCase } = require("lodash");

const { getOptionParserWithBooleansAndArrays } = require("./types");
const { namespaceAndParentNames } = require("./namespaces");

function varSegment(segment) {
  return snakeCase(segment).toUpperCase();
}

function envVarName(moduleName, namespace, optionName) {
  return [moduleName, ...namespaceAndParentNames(namespace), optionName].map(varSegment).join("_");
}

class Environment {
  constructor(moduleName) {
    this._moduleName = moduleName;
    this._config = {};
  }

  loadFromEnv(namespace, optionName) {
    return process.env[envVarName(this._moduleName, namespace, optionName)];
  }

  _readNamespace(namespace) {
    const values = namespace.options.reduce((optionsValues, option) => {
      const value = this.loadFromEnv(namespace, option.name);
      if (!isUndefined(value)) {
        const parser = getOptionParserWithBooleansAndArrays(option);
        optionsValues[option.name] = parser(value);
      }
      return optionsValues;
    }, {});
    const namespacesConfig = this._readNamespaces(namespace.namespaces);
    return { ...values, ...namespacesConfig };
  }

  _readNamespaces(namespaces) {
    return namespaces.reduce((config, namespace) => {
      const namespaceConfig = this._readNamespace(namespace);
      if (!isEmpty(namespaceConfig)) {
        if (namespace.name) {
          config[namespace.name] = namespaceConfig;
        } else {
          config = { ...config, ...namespaceConfig };
        }
      }
      return config;
    }, {});
  }

  read(namespaces) {
    this._config = this._readNamespaces(namespaces);
    return this._config;
  }
}

module.exports = Environment;
