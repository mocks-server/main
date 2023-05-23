import { isUndefined, isEmpty, snakeCase } from "lodash";

import type { ConfigurationObject } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";
import { namespaceAndParentNames } from "./ConfigNamespaceHelpers";
import type { EnvironmentConstructor, EnvironmentInterface } from "./Environment.types";
import { getOptionParserWithBooleansAndArrays } from "./Typing";

function varSegment(segment: string): string {
  return snakeCase(segment).toUpperCase();
}

function envVarName(
  moduleName: string,
  namespace: ConfigNamespaceInterface,
  optionName: string
): string {
  return [moduleName, ...namespaceAndParentNames(namespace), optionName].map(varSegment).join("_");
}

export const Environment: EnvironmentConstructor = class Environment
  implements EnvironmentInterface
{
  private _config: ConfigurationObject;
  private _moduleName: string;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
    this._config = {};
  }

  private _loadFromEnv(
    namespace: ConfigNamespaceInterface,
    optionName: string
  ): string | undefined {
    return process.env[envVarName(this._moduleName, namespace, optionName)];
  }

  private _readNamespace(namespace: ConfigNamespaceInterface): ConfigurationObject {
    const values = namespace.options.reduce((optionsValues, option) => {
      const value = this._loadFromEnv(namespace, option.name);
      if (!isUndefined(value)) {
        const parser = getOptionParserWithBooleansAndArrays(option);
        optionsValues[option.name] = parser(value);
      }
      return optionsValues;
    }, {} as ConfigurationObject);
    const namespacesConfig = this._readNamespaces(namespace.namespaces);
    return { ...values, ...namespacesConfig };
  }

  private _readNamespaces(namespaces: ConfigNamespaceInterface[]): ConfigurationObject {
    return namespaces.reduce((config, namespace: ConfigNamespaceInterface) => {
      const namespaceConfig = this._readNamespace(namespace);
      if (!isEmpty(namespaceConfig)) {
        if (!namespace.isRoot) {
          config[namespace.name] = namespaceConfig;
        } else {
          config = { ...config, ...namespaceConfig };
        }
      }
      return config;
    }, {} as ConfigurationObject);
  }

  public read(namespaces: ConfigNamespaceInterface[]): ConfigurationObject {
    this._config = this._readNamespaces(namespaces);
    return this._config;
  }
};
