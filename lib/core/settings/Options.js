/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const tracer = require("../tracer");

const CommandLineArguments = require("./CommandLineArguments");

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
  constructor(coreOptions = {}) {
    this._onlyProgrammaticOptions = coreOptions.onlyProgrammaticOptions;
    this._options = {};
    this._optionsNames = Object.keys(DEFAULT_OPTIONS);
    this._customDefaults = {};
    this._initialized = false;
    this._commandLineArguments = new CommandLineArguments(DEFAULT_OPTIONS);
  }

  async init(options) {
    const baseOptions = {
      ...DEFAULT_OPTIONS,
      ...this._customDefaults,
      ...options
    };
    if (!this._onlyProgrammaticOptions) {
      await this._commandLineArguments.init();
      this._options = this._removeDeprecatedOptions({
        ...baseOptions,
        ...this._commandLineArguments.options
      });
    } else {
      this._options = this._removeDeprecatedOptions(baseOptions);
    }
    return Promise.resolve();
  }

  get options() {
    return this._options;
  }

  addCustom(optionDetails) {
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
    if (
      !optionDetails.type ||
      !["string", "number", "boolean", "booleanString"].includes(optionDetails.type)
    ) {
      tracer.error("Please provide a valid option type between: string, number, boolean");
      return;
    }

    this._optionsNames.push(optionDetails.name);
    this._customDefaults[optionDetails.name] = optionDetails.default;
    this._commandLineArguments.addCustom(optionDetails);
  }

  // TODO, remove deprecated options
  _removeDeprecatedOptions(options) {
    if (options.feature) {
      tracer.warn(
        "Deprecation warning: --feature option will be deprecated. Use --behavior instead"
      );
      if (!options.behavior) {
        options.behavior = options.feature;
      }
      delete options.feature;
    }

    if (options.features) {
      tracer.warn(
        "Deprecation warning: --features option will be deprecated. Use --behaviors instead"
      );
      if (!options.behaviors) {
        options.behaviors = options.features;
      }
      delete options.features;
    }
    return options;
  }
}

module.exports = Options;
