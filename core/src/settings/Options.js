/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { isUndefined } = require("lodash");

const tracer = require("../tracer");

const CommandLineArguments = require("./CommandLineArguments");

const DEFAULT_OPTIONS = {
  mock: null,
  delay: 0,
  host: "0.0.0.0",
  port: 3100,
  log: "info",
  cors: true,
  corsPreFlight: true,
  // TODO, remove v1 legacy code
  behavior: null,
};

const DEPRECATED_OPTIONS = {};

class Options {
  constructor(config) {
    this._config = config;
    this._options = {};
    this._optionsNames = Object.keys(DEFAULT_OPTIONS);
    this._customDefaults = {};
    this._initialized = false;
    this._commandLineArguments = new CommandLineArguments(DEFAULT_OPTIONS);
  }

  async init() {
    if (!this._initialized) {
      this._initialized = true;
      const baseOptions = {
        ...DEFAULT_OPTIONS,
        ...this._customDefaults,
        ...this._config.options,
      };
      if (!this._config.coreOptions.disableCommandLineArguments) {
        await this._commandLineArguments.init();
        this._options = this._getValidOptions(
          this._removeDeprecatedOptions({
            ...baseOptions,
            ...this._commandLineArguments.options,
          })
        );
      } else {
        this._options = this._getValidOptions(this._removeDeprecatedOptions(baseOptions));
      }
    }
    return Promise.resolve();
  }

  get options() {
    return this._options;
  }

  _rejectCustomOption(errorMessage) {
    tracer.error(errorMessage);
    throw new Error(errorMessage);
  }

  addCustom(optionDetails) {
    const optionName = optionDetails && optionDetails.name;
    if (this._initialized) {
      this._rejectCustomOption(
        `Options are already initializated. Option ${optionName} couldn't be added`
      );
    }
    if (!optionDetails) {
      this._rejectCustomOption(`Please provide option details when adding a new option`);
    }
    if (!optionDetails.name) {
      this._rejectCustomOption("Please provide option name when adding a new option");
    }
    if (this._optionsNames.includes(optionName)) {
      this._rejectCustomOption(`Option with name "${optionName}" is already registered`);
    }
    if (!optionDetails.type || !["string", "number", "boolean"].includes(optionDetails.type)) {
      this._rejectCustomOption(
        `Option "${optionName}" with type "${optionDetails.type}" not valid. Please provide a valid option type: string, number, boolean`
      );
    }
    if (!optionDetails.description) {
      tracer.warn(
        `Missed description in option "${optionName}". Please provide option description when adding a new option`
      );
      optionDetails.description = "";
    }

    this._optionsNames.push(optionDetails.name);
    this._customDefaults[optionDetails.name] = optionDetails.default;
    this._commandLineArguments.addCustom(optionDetails);
  }

  getValidOptionName(optionName) {
    if (this._optionsNames.includes(optionName) && !DEPRECATED_OPTIONS[optionName]) {
      return optionName;
    }
    return null;
  }

  checkValidOptionName(optionName) {
    const validOptionName = this.getValidOptionName(optionName);
    if (validOptionName) {
      return validOptionName;
    }
    throw new Error("Not valid option");
  }

  _getValidOptions(options) {
    return this._optionsNames.reduce((cleanObject, currentKey) => {
      if (!isUndefined(options[currentKey])) {
        cleanObject[currentKey] = options[currentKey];
      }
      return cleanObject;
    }, {});
  }

  _removeDeprecatedOptions(options) {
    return { ...options };
  }
}

module.exports = Options;
