/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { isUndefined } = require("lodash");

const commander = require("commander");

class CommandLineArguments {
  constructor(defaultOptions) {
    this._options = {};
    this._optionsNames = Object.keys(defaultOptions);
    // TODO, generate initial options dynamically from Options object using "addCustomOption" method
    this._commander = commander
      .option("--path <path>", "Define folder from which load mocks")
      .option("--behavior <behavior>", "Define current behavior")
      .option("--delay <delay>", "Define delay time")
      .option("--host <host>", "Host for server")
      .option("--log <log>", "Log level")
      .option("--port <port>", "Port for server", parseInt)
      .option("--watch <watch>", "Watch or not", this._stringToBoolean) // TODO, change by --no-watch option
      // TODO, remove deprecated options
      .option("--feature <feature>", "Define current behavior")
      .option("--features <features>", "Define folder from which load mocks")
      .option("--behaviors <behaviors>", "Define folder from which load mocks");
  }

  init() {
    this._options = this._commander.parse(process.argv);
    return Promise.resolve();
  }

  // TODO, deprecate "stringBoolean" options. Use --no- commander feature
  _stringToBoolean(val) {
    if (isUndefined(val) || val === "true") {
      return true;
    } else if (val === "false") {
      return false;
    }
    throw new Error("Invalid boolean value");
  }

  addCustom(optionDetails) {
    const optionPrefix =
      optionDetails.type === "boolean" && optionDetails.default === true ? "--no-" : "--";
    const optionValueGetter = optionDetails.type === "boolean" ? "" : ` <${optionDetails.name}>`;
    const optionParser = optionDetails.parse
      ? optionDetails.parse
      : optionDetails.type === "number"
      ? parseInt
      : optionDetails.type === "booleanString"
      ? this._stringToBoolean
      : undefined;

    this._commander.option(
      `${optionPrefix}${optionDetails.name}${optionValueGetter}`,
      optionDetails.description,
      optionParser
    );
    this._optionsNames.push(optionDetails.name);
  }

  get options() {
    return this._options;
  }
}

module.exports = CommandLineArguments;
