/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { EncodingOption } from "fs";
import path from "path";

import {
  ConfigInterface,
  CONFIG_NAMESPACE,
  READ_FILE_OPTION,
  ALLOW_UNKNOWN_ARGUMENTS_OPTION,
  ConfigNamespaceInterface,
  OptionValue,
  OptionInterfaceGeneric,
} from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import { readFile, writeFile, copy, existsSync } from "fs-extra";
import handlebars from "handlebars";
import { isUndefined, compact } from "lodash";

import type { AlertsInterface } from "../alerts/types";
import { FILES_NAMESPACE, ENABLED_OPTION } from "../files";
import { MOCK_NAMESPACE, COLLECTIONS_NAMESPACE, SELECTED_COLLECTION } from "../mock";

import {
  SCAFFOLD_OPTION_OMITTED,
  SCAFFOLD_OPTION_VALUE,
  SCAFFOLD_OPTION_COMMENTED,
} from "./Options";

import type {
  ConfigVarName,
  ConfigVarNameWithQuotes,
  ScaffoldConstructor,
  ScaffoldInitOptions,
  ScaffoldInterface,
  ScaffoldOptions,
  OptionsScaffoldExtraData,
  OptionScaffoldOmitProperty,
  OptionScaffoldCommentedProperty,
  OptionScaffoldValueProperty,
  ScaffoldOptionOmitted,
  NamespaceTemplateData,
  OptionTemplateData,
} from "./Scaffold.types";

const READ_WRITE_FILE_OPTIONS = {
  encoding: "utf-8",
} as EncodingOption;

const ROOT_PATH = path.resolve(__dirname, "..", "..");
const TEMPLATES_PATH = path.resolve(ROOT_PATH, "templates", "scaffold");
const FILES_SCAFFOLD_PATH = path.resolve(ROOT_PATH, "scaffold", "mocks");
const DEFAULT_CONFIG_FILE = "mocks.config.js";

function readTemplate(fileName: string): Promise<string> {
  return readFile(
    path.resolve(TEMPLATES_PATH, fileName),
    READ_WRITE_FILE_OPTIONS
  ) as Promise<string>;
}

function ensureQuotes(varName: ConfigVarName | ConfigVarNameWithQuotes): ConfigVarNameWithQuotes {
  if (!varName.match(/^\w*/gi) || varName.match(/[^\w]/gi)) {
    return `"${varName}"`;
  }
  return varName as ConfigVarNameWithQuotes;
}

function getExtraDataValue(value: unknown, defaultValue?: OptionValue): OptionValue {
  return isUndefined(value) ? defaultValue : (value as unknown as OptionValue);
}

function getExtraDataProperty(
  option: OptionInterfaceGeneric,
  property:
    | OptionScaffoldOmitProperty
    | OptionScaffoldCommentedProperty
    | OptionScaffoldValueProperty,
  defaultValue?: OptionValue
): OptionValue {
  const scaffoldData: OptionsScaffoldExtraData | undefined = option.extraData?.scaffold as
    | OptionsScaffoldExtraData
    | undefined;
  const value = scaffoldData && scaffoldData[property];
  return getExtraDataValue(value, defaultValue);
}

function isOptionCommented(option: OptionInterfaceGeneric) {
  return !!getExtraDataProperty(option, SCAFFOLD_OPTION_COMMENTED, true);
}

function isOptionOmitted(
  option: OptionInterfaceGeneric,
  namespace?: ConfigNamespaceInterface
): ScaffoldOptionOmitted {
  // Exclude config options that has no sense to define in file
  if (
    namespace &&
    namespace.name === CONFIG_NAMESPACE &&
    option.name !== ALLOW_UNKNOWN_ARGUMENTS_OPTION
  ) {
    return true;
  }
  return !!getExtraDataProperty(option, SCAFFOLD_OPTION_OMITTED, false);
}

function optionScaffoldValue(option: OptionInterfaceGeneric): OptionValue {
  return getExtraDataProperty(option, SCAFFOLD_OPTION_VALUE);
}

function getOptionValue(option: OptionInterfaceGeneric): OptionValue {
  const scaffoldValue = optionScaffoldValue(option);
  const value = !isUndefined(scaffoldValue) ? scaffoldValue : option.value;
  if (isUndefined(value)) {
    return "undefined";
  }
  return JSON.stringify(value);
}

function parseOptionForTemplate(option: OptionInterfaceGeneric) {
  return {
    name: ensureQuotes(option.name),
    value: getOptionValue(option),
    description: option.description,
    commented: isOptionCommented(option),
  };
}

function parseOptionsForTemplate(
  options: OptionInterfaceGeneric[],
  namespace?: ConfigNamespaceInterface
): OptionTemplateData[] | undefined {
  if (options) {
    return compact(
      options.map((option: OptionInterfaceGeneric) => {
        if (!isOptionOmitted(option, namespace)) {
          return parseOptionForTemplate(option);
        }
      })
    );
  }
}

function parseNamespaceForTemplate(namespace: ConfigNamespaceInterface): NamespaceTemplateData {
  return {
    name: ensureQuotes(namespace.name),
    options: parseOptionsForTemplate(namespace.options, namespace),
    namespaces: parseNamespacesForTemplates(namespace.namespaces),
  };
}

function parseNamespacesForTemplates(
  namespaces?: ConfigNamespaceInterface[]
): NamespaceTemplateData[] | undefined {
  if (namespaces) {
    return namespaces.map(parseNamespaceForTemplate);
  }
}

export const Scaffold: ScaffoldConstructor = class Scaffold implements ScaffoldInterface {
  private _logger: LoggerInterface;
  private _config: ConfigInterface;
  private _alerts: AlertsInterface;
  private _readConfigFileOption: OptionInterfaceGeneric;
  private _filesEnabledOption: OptionInterfaceGeneric;
  private _collectionSelectedOption: OptionInterfaceGeneric;

  static get id() {
    return "scaffold";
  }

  constructor({ config, alerts, logger }: ScaffoldOptions) {
    this._logger = logger;
    this._config = config;
    this._readConfigFileOption = this._config
      .namespace(CONFIG_NAMESPACE)
      ?.option(READ_FILE_OPTION) as OptionInterfaceGeneric;
    this._filesEnabledOption = this._config
      .namespace(FILES_NAMESPACE)
      ?.option(ENABLED_OPTION) as OptionInterfaceGeneric;
    this._collectionSelectedOption = this._config
      .namespace(MOCK_NAMESPACE)
      ?.namespace(COLLECTIONS_NAMESPACE)
      ?.option(SELECTED_COLLECTION) as OptionInterfaceGeneric;
    this._alerts = alerts;
  }

  _parseConfigForTemplates() {
    return {
      namespaces: parseNamespacesForTemplates(this._config.namespaces),
      options: parseOptionsForTemplate(this._config.options),
    };
  }

  async _createConfig(): Promise<void> {
    this._logger.info("Creating config file");
    const configTemplate = await readTemplate("config.hbs");
    const namespaceTemplate = await readTemplate("namespace.hbs");
    const optionTemplate = await readTemplate("option.hbs");

    handlebars.registerPartial("namespace", namespaceTemplate);
    handlebars.registerPartial("option", optionTemplate);
    const fileContent = handlebars.compile(configTemplate)(this._parseConfigForTemplates());
    return writeFile(
      path.resolve(process.cwd(), DEFAULT_CONFIG_FILE),
      fileContent,
      READ_WRITE_FILE_OPTIONS
    );
  }

  _createFolder(destPath: string): Promise<void> {
    this._logger.info("Creating scaffold folder");
    return copy(FILES_SCAFFOLD_PATH, destPath);
  }

  _checkAndCreateConfigScaffold(): Promise<void> {
    const configFileLoaded = !!this._config.loadedFile;

    if (this._readConfigFileOption.value && !configFileLoaded) {
      this._alerts.set("config", "Configuration file was not found. A scaffold was created");
      if (!this._collectionSelectedOption.hasBeenSet) {
        this._collectionSelectedOption.value = "base";
      }
      return this._createConfig();
    }
    return Promise.resolve();
  }

  _checkAndCreateFolderScaffold(filesLoaderPath: string): Promise<void> {
    if (this._filesEnabledOption.value && !existsSync(filesLoaderPath)) {
      this._alerts.set("folder", "Mocks Server folder was not found. A scaffold was created");
      return this._createFolder(filesLoaderPath);
    }
    return Promise.resolve();
  }

  async init({ folderPath }: ScaffoldInitOptions): Promise<void> {
    await Promise.all([
      this._checkAndCreateFolderScaffold(folderPath),
      this._checkAndCreateConfigScaffold(),
    ]);
  }
};
