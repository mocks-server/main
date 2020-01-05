const path = require("path");
const fsExtra = require("fs-extra");

const tracer = require("./tracer");
const isPromise = require("is-promise");
const { isFunction, isObject } = require("lodash");

const CONFIG_FILE = "mocks-server.config.js";

class Config {
  constructor(programmaticConfig = {}) {
    this._coreOptions = {};
    this._options = {};
    this._getCoreOptions(programmaticConfig);
    this._getOptions(programmaticConfig.options);
  }

  init(options) {
    this._getOptions(options);
    return this._getFileConfig();
  }

  _catchFileConfigError(error) {
    tracer.error("Error in configuration file");
    console.log(error);
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
            .then(fileConfig => {
              if (!isObject(fileConfig)) {
                return Promise.reject(
                  new Error("Configuration file promise should return an object")
                );
              }
              return this._readConfigFileSuccess(fileConfig);
            })
            .catch(error => {
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

  _getFileConfig() {
    if (this._coreOptions.disableConfigFile) {
      tracer.info(`Configuration file is disabled`);
      return Promise.resolve();
    }
    const configFilePath = this._getFileConfigPath(this._coreOptions.configFile || CONFIG_FILE);
    return fsExtra.pathExists(configFilePath).then(exists => {
      if (!exists) {
        tracer.info(`Configuration file not found`);
        return Promise.resolve();
      }
      return this._readFileConfig(configFilePath).then(fileConfig => {
        this._getCoreOptions(fileConfig);
        this._getOptions(fileConfig.options);
        tracer.debug(`Config in file: ${JSON.stringify(fileConfig, null, 2)}`);
        return Promise.resolve();
      });
    });
  }

  _getOptions(options) {
    this._options = {
      ...this._options,
      ...options
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
    if (config.hasOwnProperty("configFile")) {
      this._coreOptions.configFile = config.configFile;
    }
  }

  get coreOptions() {
    return this._coreOptions;
  }

  get options() {
    return this._options;
  }
}

module.exports = Config;
