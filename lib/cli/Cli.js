/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const chalk = require("chalk");
const { isNumber } = require("lodash");

const inquirer = require("./Inquirer");

const questions = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: [
      {
        name: "Change current behavior",
        value: "behavior"
      },
      {
        name: "Change delay",
        value: "delay"
      },
      {
        name: "Restart server",
        value: "restart"
      },
      {
        name: "Change log level",
        value: "logLevel"
      },
      {
        name: "Switch watch",
        value: "watch"
      },
      {
        name: "Display server logs",
        value: "logs"
      }
    ]
  },
  logLevel: {
    type: "list",
    message: "Select log level:",
    name: "value",
    choices: ["silly", "debug", "verbose", "info", "warn", "error"]
  },
  behavior: {
    type: "autocomplete",
    name: "value",
    message: "Please choose behavior"
  },
  delay: {
    type: "input",
    name: "value",
    message: "Enter delay time in ms:",
    validate: value => isNumber(value),
    filter: value => {
      if (/^\d*$/.test(value)) {
        return parseInt(value, 10);
      }
      return false;
    }
  }
};

const SCREENS = {
  MAIN: "main",
  BEHAVIOR: "behavior",
  DELAY: "delay",
  LOG_LEVEL: "log-level",
  LOGS: "logs"
};

class Cli {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = core.settings;
    this._inited = false;
    this._currentScreen = null;

    this._onFilesLoaded = this._onFilesLoaded.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);

    this._core.addCustomSetting({
      name: "cli",
      type: "booleanString", // Workaround to maintain retrocompatibility with --cli=false
      description: "Start interactive CLI plugin",
      default: true
    });
  }

  init() {
    if (!this._settings.get("cli")) {
      return Promise.resolve();
    }
    this._questions = questions;
    this._cli = new inquirer.Inquirer(
      this._questions,
      this._header.bind(this) // TODO, deprecate quit method
    );
    this._logLevel = this._settings.get("log");
    this._inited = true;
    this._core.onChangeSettings(this._onChangeSettings);
    return Promise.resolve();
  }

  start() {
    if (!this._inited) {
      return Promise.resolve();
    }
    this.__stopListeningFilesLoad = this._core.onLoadFiles(this._onFilesLoaded);
    this._silentTraces();
    return this._displayMainMenu();
  }

  _onFilesLoaded() {
    this._cli.removeListeners();
    this._cli.exitLogsMode();
    return this._displayMainMenu();
  }

  _onChangeSettings() {
    if (this._currentScreen === SCREENS.MAIN) {
      this._cli.removeListeners();
      return this._displayMainMenu();
    }
  }

  get _serverUrl() {
    return `http://${this._settings.get("host")}:${this._settings.get("port")}`;
  }

  _header() {
    const header = [
      `Mocks server listening at: ${chalk.cyan(this._serverUrl)}`,
      `Delay: ${chalk.cyan(this._settings.get("delay"))}`,
      `Behaviors: ${chalk.cyan(this._core.behaviors.totalBehaviors)}`,
      `Current behavior: ${chalk.cyan(this._core.behaviors.currentName || "-")}`,
      `Current fixtures: ${chalk.cyan(this._core.behaviors.currentTotalFixtures || 0)}`,
      `Log level: ${chalk.cyan(this._logLevel)}`,
      `Watch enabled: ${chalk.cyan(this._settings.get("watch"))}`,
      `SETTINGS: ${JSON.stringify(this._settings._optionsHandler.options)}`
    ];

    if (this._core.serverError) {
      header.unshift(
        chalk.red.bold(`There was an error restarting server: ${this._core.serverError.message}`)
      );
    }

    return header;
  }

  async _displayMainMenu() {
    this._cli.clearScreen();
    this._currentScreen = SCREENS.MAIN;
    const action = await this._cli.inquire("main");
    switch (action) {
      case "behavior":
        return this._changeCurrentBehavior();
      case "delay":
        return this._changeDelay();
      case "restart":
        return this._restartServer();
      case "logLevel":
        return this._changeLogLevel();
      case "watch":
        return this._switchWatch();
      case "logs":
        return this._displayLogs();
    }
  }

  async _changeCurrentBehavior() {
    this._currentScreen = SCREENS.BEHAVIOR;
    this._cli.clearScreen();
    const behaviorsNames = this._core.behaviors.names;
    const behavior = await this._cli.inquire("behavior", {
      source: (answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(behaviorsNames);
        }
        return Promise.resolve(
          behaviorsNames.filter(currentBehavior => currentBehavior.includes(input))
        );
      }
    });
    this._settings.set("behavior", behavior);
    return this._displayMainMenu();
  }

  async _changeDelay() {
    this._currentScreen = SCREENS.DELAY;
    this._cli.clearScreen();
    const delay = await this._cli.inquire("delay");
    this._settings.set("delay", delay);
    return this._displayMainMenu();
  }

  async _restartServer() {
    try {
      await this._core.restart();
    } catch (err) {}
    return this._displayMainMenu();
  }

  async _switchWatch() {
    this._settings.set("watch", !this._settings.get("watch"));
    return this._displayMainMenu();
  }

  async _changeLogLevel() {
    this._currentScreen = SCREENS.LOG_LEVEL;
    this._cli.clearScreen();
    this._logLevel = await this._cli.inquire("logLevel");
    return this._displayMainMenu();
  }

  async _displayLogs() {
    this._currentScreen = SCREENS.LOGS;
    this._cli.clearScreen();
    await this._cli.logsMode(() => {
      this._settings.set("log", this._logLevel);
    });
    this._silentTraces();
    return this._displayMainMenu();
  }

  _silentTraces() {
    this._settings.set("log", "silent");
  }

  stopListeningServerWatch() {
    if (this._stopListeningFilesLoad) {
      this._stopListeningFilesLoad();
    }
  }
}

module.exports = Cli;
