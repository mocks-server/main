/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");

const tracer = require("./tracer");
const isPromise = require("is-promise");
const { isFunction, isObject } = require("lodash");

const { createConfigFile } = require("./support/scaffold");

const CONFIG_FILE = "mocks.config.js";

class Config {
  constructor({ addAlert, programmaticConfig = {} }) {
    this._coreOptions = {};
    this._addAlert = addAlert;
    this._options = {};
    this._getCoreOptions(programmaticConfig);
    this._getOptions(programmaticConfig.options);
  }

  init(options) {
    this._getOptions(options);
    return this._getFileConfig();
  }

  _catchFileConfigError(error) {
    this._addAlert("file", "Error in configuration file", error);
    return Promise.resolve({});
  }

  _readConfigFileSuccess(configFileResult) {
    delete this._coreOptions.options;
    tracer.info(`Configuration file successfully loaded`);
    return Promise.resolve(configFileResult);
  }

  _readFileConfig(configFilePath) {
    tracer.info("Reading configuration file");
    try {
      const configFile = require(configFilePath);
      if (isFunction(configFile)) {
        this._coreOptions.options = this._options;
        const configFileResult = configFile(this._coreOptions);
        if (isPromise(configFileResult)) {
          return configFileResult
            .then((fileConfig) => {
              if (!isObject(fileConfig)) {
                return Promise.reject(
                  new Error("Configuration file promise should return an object")
                );
              }
              return this._readConfigFileSuccess(fileConfig);
            })
            .catch((error) => {
              return this._catchFileConfigError(error);
            });
        } else if (isObject(configFileResult)) {
          return this._readConfigFileSuccess(configFileResult);
        }
        throw new Error("Configuration file function should return an object or a promise");
      } else if (isObject(configFile)) {
        return this._readConfigFileSuccess(configFile);
      }
      throw new Error("Configuration file should export an object or a function");
    } catch (error) {
      return this._catchFileConfigError(error);
    }
  }

  _getFileConfigPath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(process.cwd(), filePath);
  }

  _readConfig(configFilePath) {
    return this._readFileConfig(configFilePath).then((fileConfig) => {
      this._getCoreOptions(fileConfig);
      this._getOptions(fileConfig.options);
      tracer.debug(`Config in file: ${JSON.stringify(fileConfig, null, 2)}`);
      return Promise.resolve();
    });
  }

  _getFileConfig() {
    if (this._coreOptions.disableConfigFile) {
      tracer.info(`Configuration file is disabled`);
      return Promise.resolve();
    }
    const configFilePath = this._getFileConfigPath(this._coreOptions.configFile || CONFIG_FILE);
    return fsExtra.pathExists(configFilePath).then((exists) => {
      if (!exists) {
        tracer.info(`Configuration file not found`);
        return createConfigFile(configFilePath)
          .then(() => {
            tracer.info(`Created configuration file from scaffold`);
            return this._readConfig(configFilePath);
          })
          .catch((err) => {
            tracer.error(`Error creating config file: ${err.message}`);
            return Promise.resolve();
          });
      }
      return this._readConfig(configFilePath);
    });
  }

  _getOptions(options) {
    this._options = {
      ...this._options,
      ...options,
    };
    if (this._options.log) {
      tracer.set(this._options.log);
    }
  }

  _getCoreOptions(config) {
    if (config.onlyProgrammaticOptions) {
      this._coreOptions.disableCommandLineArguments = true;
      this._coreOptions.disableConfigFile = true;
    }
    if (config.hasOwnProperty("disableCommandLineArguments")) {
      this._coreOptions.disableCommandLineArguments = config.disableCommandLineArguments;
    }
    if (config.hasOwnProperty("disableConfigFile")) {
      this._coreOptions.disableConfigFile = config.disableConfigFile;
    }
    if (config.hasOwnProperty("plugins")) {
      this._coreOptions.plugins = config.plugins;
    }
    if (config.hasOwnProperty("addPlugins")) {
      this._coreOptions.plugins = this._coreOptions.plugins || [];
      this._coreOptions.plugins = this._coreOptions.plugins.concat(config.addPlugins);
    }
    if (config.hasOwnProperty("addRoutesHandlers")) {
      this._coreOptions.routesHandlers = this._coreOptions.routesHandlers || [];
      this._coreOptions.routesHandlers = this._coreOptions.routesHandlers.concat(
        config.addRoutesHandlers
      );
    }
    if (config.hasOwnProperty("configFile")) {
      this._coreOptions.configFile = config.configFile;
    }
    if (config.hasOwnProperty("babelRegister")) {
      this._coreOptions.babelRegister = config.babelRegister;
    }
    this._coreOptions.babelRegisterOptions = config.babelRegisterOptions || {};
  }

  get coreOptions() {
    return this._coreOptions;
  }

  get options() {
    return this._options;
  }
}

module.exports = Config;
