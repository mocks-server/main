const { isUndefined, snakeCase } = require("lodash");

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

  _readNamespace(namespace, config) {
    let namespaceConfig = config;
    if (namespace.name) {
      config[namespace.name] = config[namespace.name] || {};
      namespaceConfig = config[namespace.name];
    }
    namespace.options.forEach((option) => {
      const value = this.loadFromEnv(namespace, option.name);
      if (!isUndefined(value)) {
        const parser = getOptionParserWithBooleansAndArrays(option);
        namespaceConfig[option.name] = parser(value);
      }
    });
    this._readNamespaces(namespace.namespaces, namespaceConfig);
  }

  _readNamespaces(namespaces, config) {
    namespaces.forEach((namespace) => {
      this._readNamespace(namespace, config);
    });
  }

  read(namespaces) {
    const config = {};
    this._readNamespaces(namespaces, config);
    this._config = config;
    return this._config;
  }
}

module.exports = Environment;
