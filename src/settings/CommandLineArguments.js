/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const commander = require("commander");
commander.storeOptionsAsProperties(true);

const { getOptionParser } = require("./helpers");

class CommandLineArguments {
  constructor(defaultOptions) {
    this._options = {};
    this._optionsNames = Object.keys(defaultOptions);
    this._booleanOptionsWithTrueDefaults = ["cors", "corsPreFlight"];
    // TODO, generate initial options dynamically from Options object using the "addCustom" method
    this._commander = commander
      // TODO, remove v1 legacy code
      .option("--behavior <behavior>", "Current behavior for legacy mocks")
      .option("--mock <mock>", "Current mock")
      .option("--delay <delay>", "Define delay time")
      .option("--host <host>", "Host for server")
      .option("--log <log>", "Log level")
      .option("--port <port>", "Port for server", parseInt)
      .option("--no-cors", "Disable cors middleware")
      .option("--no-corsPreFlight", "Disable cors pre-flight middleware");
  }

  init() {
    const commanderParsed = this._commander.parse(process.argv);
    this._options = this._optionsNames.reduce((options, optionName) => {
      if (
        commanderParsed.hasOwnProperty(optionName) &&
        // Remove boolean options with true value by default, as commander always defines them explicitly as true
        !(
          this._booleanOptionsWithTrueDefaults.includes(optionName) &&
          commanderParsed[optionName] === true
        )
      ) {
        options[optionName] = commanderParsed[optionName];
      }
      return options;
    }, {});

    return Promise.resolve();
  }

  addCustom(optionDetails) {
    const isBoolean = optionDetails.type === "boolean";
    const defaultIsTrue = optionDetails.default === true;
    const optionPrefix = isBoolean && defaultIsTrue ? "--no-" : "--";
    const optionValueGetter = isBoolean ? "" : ` <${optionDetails.name}>`;
    const optionParser = getOptionParser(optionDetails);

    this._commander.option(
      `${optionPrefix}${optionDetails.name}${optionValueGetter}`,
      optionDetails.description,
      optionParser
    );
    this._optionsNames.push(optionDetails.name);
    if (isBoolean && defaultIsTrue) {
      this._booleanOptionsWithTrueDefaults.push(optionDetails.name);
    }
  }

  get options() {
    return this._options;
  }
}

module.exports = CommandLineArguments;
