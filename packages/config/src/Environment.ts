import { isUndefined, isEmpty, snakeCase } from "lodash";

import { getOptionParserWithBooleansAndArrays } from "./types";
import { namespaceAndParentNames } from "./namespaces";
import type { EnvironmentInterface } from "./types/Environment";
import type { Namespaces, Namespace } from "./types/Namespace";
import type { ConfigObject } from "./types/Common";

function varSegment(segment: string): string {
  return snakeCase(segment).toUpperCase();
}

function envVarName(moduleName: string, namespace: Namespace, optionName: string): string {
  return [moduleName, ...namespaceAndParentNames(namespace), optionName].map(varSegment).join("_");
}

class Environment implements EnvironmentInterface {
  private _config: ConfigObject;
  private _moduleName: string;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
    this._config = {};
  }

  private _loadFromEnv(namespace: Namespace, optionName: string): string | undefined {
    return process.env[envVarName(this._moduleName, namespace, optionName)];
  }

  private _readNamespace(namespace: Namespace): ConfigObject {
    const values = namespace.options.reduce((optionsValues, option) => {
      const value = this._loadFromEnv(namespace, option.name);
      if (!isUndefined(value)) {
        const parser = getOptionParserWithBooleansAndArrays(option);
        optionsValues[option.name] = parser(value);
      }
      return optionsValues;
    }, {} as ConfigObject);
    const namespacesConfig = this._readNamespaces(namespace.namespaces);
    return { ...values, ...namespacesConfig };
  }

  private _readNamespaces(namespaces: Namespaces): ConfigObject {
    return namespaces.reduce((config, namespace: Namespace) => {
      const namespaceConfig = this._readNamespace(namespace);
      if (!isEmpty(namespaceConfig)) {
        if (namespace.name) {
          config[namespace.name] = namespaceConfig;
        } else {
          config = { ...config, ...namespaceConfig };
        }
      }
      return config;
    }, {} as ConfigObject);
  }

  read(namespaces: Namespaces): ConfigObject {
    this._config = this._readNamespaces(namespaces);
    return this._config;
  }
}

export default Environment;
