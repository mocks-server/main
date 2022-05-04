const { isUndefined, snakeCase, compact } = require("lodash");

const { getOptionParserIncludingBooleans } = require("./types");

function varSegment(segment) {
  return snakeCase(segment).toUpperCase();
}

function envVarName(scopes) {
  return compact(scopes).map(varSegment).join("_");
}

class Environment {
  constructor(moduleName) {
    this._moduleName = moduleName;
    this._config = {};
  }

  loadFromEnv(groupName, namespaceName, optionName) {
    return process.env[envVarName([this._moduleName, groupName, namespaceName, optionName])];
  }

  read(groups) {
    this._config = {};
    groups.forEach((group) => {
      group.namespaces.forEach((namespace) => {
        namespace.options.forEach((option) => {
          const value = this.loadFromEnv(group.name, namespace.name, option.name);
          if (!isUndefined(value)) {
            let groupConfig = this._config;
            if (group.name) {
              this._config[group.name] = this._config[group.name] || {};
              groupConfig = this._config[group.name];
            }
            groupConfig[namespace.name] = groupConfig[namespace.name] || {};
            const parser = getOptionParserIncludingBooleans(option);
            groupConfig[namespace.name][option.name] = parser(value);
          }
        });
      });
    });
    return this._config;
  }
}

module.exports = Environment;
