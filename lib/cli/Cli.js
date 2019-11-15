/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const chalk = require("chalk");
const { isNumber, isUndefined } = require("lodash");

const inquirer = require("./Inquirer");
const { WATCH_RELOAD } = require("./constants");

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

class Cli {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;

    this._core.addCustomOption({
      name: "cli",
      type: "string",
      description: "Start interactive CLI plugin",
      default: "true",
      parse: this._stringToBoolean
    });
  }

  _stringToBoolean(val) {
    if (val === "true") {
      return true;
    } else if (isUndefined(val) || val === "false") {
      return false;
    }
    throw new Error("Invalid boolean value");
  }

  init(options = {}) {
    this._options = { ...options };
    if (!this._options.cli) {
      return;
    }
    this._questions = questions;
    this._cli = new inquirer.Inquirer(
      this._questions,
      this.header.bind(this) /*, quitMethod DEPRECATED*/
    );
    this._serverUrl = `http://${this._options.host}:${this._options.port}`;
    // remove both
    this._logLevel = this._options.log;
    this.watchReloaded = this.watchReloaded.bind(this);
  }

  start() {
    this._core.eventEmitter.on(WATCH_RELOAD, this.watchReloaded);
    this.silentTraces();
    return this.displayMainMenu();
  }

  watchReloaded() {
    this._cli.removeListeners();
    this._cli.exitLogsMode();
    return this.displayMainMenu();
  }

  header() {
    const header = [
      `Mocks server listening at: ${chalk.cyan(this._serverUrl)}`,
      `Delay: ${chalk.cyan(this._core.settings.delay)}`,
      `Behaviors: ${chalk.cyan(this._core.behaviors.totalBehaviors)}`,
      `Current behavior: ${chalk.cyan(this._core.behaviors.currentName || "-")}`,
      `Current fixtures: ${chalk.cyan(this._core.behaviors.currentTotalFixtures || 0)}`,
      `Log level: ${chalk.cyan(this._logLevel)}`,
      `Watch enabled: ${chalk.cyan(this._core.watchEnabled)}`
    ];

    if (this._core.serverError) {
      header.unshift(
        chalk.red.bold(`There was an error restarting server: ${this._core.serverError.message}`)
      );
    }

    return header;
  }

  async displayMainMenu() {
    this._cli.clearScreen();
    const action = await this._cli.inquire("main");
    switch (action) {
      case "behavior":
        return this.changeCurrentBehavior();
      case "delay":
        return this.changeDelay();
      case "restart":
        return this.restartServer();
      case "logLevel":
        return this.logLevel();
      case "watch":
        return this.switchWatch();
      case "logs":
        return this.displayLogs();
    }
  }

  async changeCurrentBehavior() {
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
    this._core.behaviors.current = behavior;
    return this.displayMainMenu();
  }

  async changeDelay() {
    this._cli.clearScreen();
    const delay = await this._cli.inquire("delay");
    this._core.settings.delay = delay;
    return this.displayMainMenu();
  }

  async restartServer() {
    try {
      await this._core.restart();
    } catch (err) {}
    return this.displayMainMenu();
  }

  async switchWatch() {
    this._core.switchWatch(!this._core.watchEnabled);
    return this.displayMainMenu();
  }

  async logLevel() {
    this._cli.clearScreen();
    this._logLevel = await this._cli.inquire("logLevel");
    return this.displayMainMenu();
  }

  async displayLogs() {
    this._cli.clearScreen();
    await this._cli.logsMode(() => {
      this._tracer.set("console", this._logLevel);
    });
    this.silentTraces();
    return this.displayMainMenu();
  }

  silentTraces() {
    this._tracer.set("console", "silent");
  }

  stopListeningServerWatch() {
    this._core.events.removeListener(WATCH_RELOAD, this.watchReloaded);
  }
}

module.exports = Cli;
