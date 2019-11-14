/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const commander = require("commander");
const { isUndefined } = require("lodash");
const tracer = require("./tracer");

const DEFAULT_OPTIONS = {
  behavior: null,
  behaviors: null,
  delay: 0,
  host: "0.0.0.0",
  port: 3100,
  watch: true,
  log: "info",
  // TODO, remove deprecated options
  feature: null,
  features: null
};

class Options {
  constructor() {
    this._options = {};
    this._customDefaults = {};
    this._optionsNames = Object.keys(DEFAULT_OPTIONS);
    this._commander = commander
      .option("--behavior <behavior>", "Define current behavior")
      .option("--behaviors <behaviors>", "Define folder from which load behaviors")
      .option("--delay <delay>", "Define delay time")
      .option("--host <host>", "Host for server")
      .option("--log <log>", "Log level")
      .option("--port <port>", "Port for server", parseInt)
      .option("--watch", "Watch or not", this._stringToBoolean)
      // TODO, remove deprecated options
      .option("--feature <feature>", "Define current behavior")
      .option("--features <features>", "Define folder from which load behaviors");
  }

  _stringToBoolean(val) {
    if (val === "true") {
      return true;
    } else if (isUndefined(val) || val === "false") {
      return false;
    }
    throw new Error("Invalid boolean value");
  }

  _getDefinedOptions(options, keys) {
    return keys.reduce((cleanObject, currentKey) => {
      if (!isUndefined(options[currentKey])) {
        cleanObject[currentKey] = options[currentKey];
      }
      return cleanObject;
    }, {});
  }

  _removeDeprecatedOptions() {
    if (this.options.feature) {
      tracer.warn(
        "Deprecation warning: --feature option will be deprecated. Use --behavior instead"
      );
      if (!this.options.behavior) {
        this._options.behavior = this.options.feature;
      }
      delete this._options.feature;
    }

    if (this.options.features) {
      tracer.warn(
        "Deprecation warning: --features option will be deprecated. Use --behaviors instead"
      );
      if (!this.options.behaviors) {
        this._options.behaviors = this.options.features;
      }
      delete this._options.features;
    }
  }

  addCustomOption(optionDetails) {
    if (this._initialized) {
      tracer.error("Options are already initializated. No more options can be added");
      return;
    }
    if (!optionDetails) {
      tracer.error("Please provide option details when adding a new option");
      return;
    }
    if (!optionDetails.name) {
      tracer.error("Please provide option name when adding a new option");
      return;
    }
    if (this._optionsNames.includes(optionDetails.name)) {
      tracer.error(`Option with name ${optionDetails.name} is already registered`);
      return;
    }
    if (!optionDetails.description) {
      tracer.error("Please provide option description when adding a new option");
      return;
    }
    if (!optionDetails.type || !["string", "number", "boolean"].includes(optionDetails.type)) {
      tracer.error("Please provide a valid option type between: string, number, boolean");
      return;
    }
    const optionValueGetter = optionDetails.type === "string" ? ` <${optionDetails.name}>` : "";
    const optionParser = optionDetails.parse
      ? optionDetails.parse
      : optionDetails.type === "number"
      ? parseInt
      : undefined;
    const optionPrefix =
      optionDetails.type === "boolean" && optionDetails.default === true ? "--no-" : "--";
    this._commander.option(
      `${optionPrefix}${optionDetails.name}${optionValueGetter}`,
      optionDetails.description,
      optionParser
    );
    this._optionsNames.push(optionDetails.name);
    this._customDefaults[optionDetails.name] = optionDetails.default;
  }

  init() {
    if (this._initialized === true) {
      tracer.error("Options are already initializated");
      return;
    }
    this._initialized = true;
    this._options = {
      ...DEFAULT_OPTIONS,
      ...this._customDefaults,
      ...this._getDefinedOptions(this._commander.parse(process.argv), this._optionsNames)
    };

    this._removeDeprecatedOptions();

    // Promise because async methods will be added to read options, such as reading files, etc.
    return Promise.resolve(this.options);
  }

  get options() {
    return this._options;
  }
}

module.exports = Options;
