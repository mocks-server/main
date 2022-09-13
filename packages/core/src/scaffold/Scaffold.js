/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const fsExtra = require("fs-extra");
const handlebars = require("handlebars");
const { isUndefined, compact } = require("lodash");

const READ_WRITE_FILE_OPTIONS = {
  encoding: "utf8",
};

const FILES_SCAFFOLD_PATH = path.resolve(__dirname, "mocks");
const DEFAULT_CONFIG_FILE = "mocks.config.js";

function readTemplate(fileName) {
  return fsExtra.readFile(path.resolve(__dirname, fileName), READ_WRITE_FILE_OPTIONS);
}

function ensureQuotes(varName) {
  if (!varName.match(/^\w*/gi) || varName.match(/[^\w]/gi)) {
    return `"${varName}"`;
  }
  return varName;
}

function getExtraDataValue(value, defaultValue) {
  return isUndefined(value) ? defaultValue : value;
}

function getExtraDataProperty(option, property, defaultValue) {
  const value =
    option.extraData && option.extraData.scaffold && option.extraData.scaffold[property];
  return getExtraDataValue(value, defaultValue);
}

function isOptionCommented(option) {
  return !!getExtraDataProperty(option, "commented", true);
}

function isOptionOmitted(option, namespace) {
  // Exclude config options that has no sense to define in file
  if (namespace && namespace.name === "config" && option.name !== "allowUnknownArguments") {
    return true;
  }
  return !!getExtraDataProperty(option, "omit", false);
}

function optionScaffoldValue(option) {
  return getExtraDataProperty(option, "value");
}

function getOptionValue(option) {
  const scaffoldValue = optionScaffoldValue(option);
  const value = !isUndefined(scaffoldValue) ? scaffoldValue : option.value;
  if (isUndefined(value)) {
    return "undefined";
  }
  return JSON.stringify(value);
}

function parseOptionsForTemplate(options, namespace) {
  if (options) {
    return compact(
      options.map((option) => {
        if (!isOptionOmitted(option, namespace)) {
          return {
            name: ensureQuotes(option.name),
            value: getOptionValue(option),
            description: option.description,
            commented: isOptionCommented(option),
          };
        }
      })
    );
  }
}

function parseNamespacesForTemplates(namespaces) {
  if (namespaces) {
    return compact(
      namespaces.map((namespace) => {
        if (namespace.name) {
          return {
            name: ensureQuotes(namespace.name),
            options: parseOptionsForTemplate(namespace.options, namespace),
            namespaces: parseNamespacesForTemplates(namespace.namespaces),
          };
        }
      })
    );
  }
}

class Scaffold {
  static get id() {
    return "scaffold";
  }

  constructor({ config, alerts, logger }) {
    this._logger = logger;
    this._config = config;
    this._readConfigFileOption = this._config.namespace("config").option("readFile");
    this._filesEnabledOption = this._config.namespace("files").option("enabled");
    this._collectionSelectedOption = this._config
      .namespace("mock")
      .namespace("collections")
      .option("selected");
    this._alerts = alerts;
  }

  _parseConfigForTemplates() {
    return {
      namespaces: parseNamespacesForTemplates(this._config.namespaces),
      options: parseOptionsForTemplate(this._config.options),
    };
  }

  async _createConfig() {
    this._logger.info("Creating config file");
    const configTemplate = await readTemplate("config.hbs");
    const namespaceTemplate = await readTemplate("namespace.hbs");
    const optionTemplate = await readTemplate("option.hbs");

    handlebars.registerPartial("namespace", namespaceTemplate);
    handlebars.registerPartial("option", optionTemplate);
    const fileContent = handlebars.compile(configTemplate)(this._parseConfigForTemplates());
    return fsExtra.writeFile(
      path.resolve(process.cwd(), DEFAULT_CONFIG_FILE),
      fileContent,
      READ_WRITE_FILE_OPTIONS
    );
  }

  _createFolder(destPath) {
    this._logger.info("Creating scaffold folder");
    return fsExtra.copy(FILES_SCAFFOLD_PATH, destPath);
  }

  _checkAndCreateConfigScaffold() {
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

  _checkAndCreateFolderScaffold(filesLoaderPath) {
    if (this._filesEnabledOption.value && !fsExtra.existsSync(filesLoaderPath)) {
      this._alerts.set("folder", "Mocks Server folder was not found. A scaffold was created");
      return this._createFolder(filesLoaderPath);
    }
    return Promise.resolve();
  }

  init({ filesLoaderPath }) {
    return Promise.all([
      this._checkAndCreateFolderScaffold(filesLoaderPath),
      this._checkAndCreateConfigScaffold(),
    ]);
  }
}

module.exports = Scaffold;
