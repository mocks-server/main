"use strict";

const chalk = require("chalk");
const { isNumber } = require("lodash");

const baseCli = require("./base-cli");
const tracer = require("./common/tracer");
const { WATCH_RELOAD } = require("./common/constants");
const Server = require("./Server");

const questions = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: [
      {
        name: "Change current feature",
        value: "feature"
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
  feature: {
    type: "autocomplete",
    name: "value",
    message: "Please choose feature"
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
  constructor(options, quitMethod) {
    this._options = options || {};
    this._questions = questions;
    this._cli = new baseCli.Inquirer(this._questions, this.header.bind(this), quitMethod);
    this._server = new Server(this._options.features, this._options);
    this._serverUrl = `http://${this._options.host}:${this._options.port}`;
    this._features = this._server.features;
    this._settings = this._server.settings;
    this._logLevel = this._options.log;
    this.watchReloaded = this.watchReloaded.bind(this);
  }

  watchReloaded() {
    this._cli.removeListeners();
    this._cli.exitLogsMode();
    this._features = this._server.features;
    return this.displayMainMenu();
  }

  header() {
    const header = [
      `Mocks server listening at: ${chalk.cyan(this._serverUrl)}`,
      `Delay: ${chalk.cyan(this._settings.delay)}`,
      `Features: ${chalk.cyan(this._features.totalFeatures)}`,
      `Current feature: ${chalk.cyan(this._features.currentName)}`,
      `Current fixtures: ${chalk.cyan(this._features.currentTotalFixtures)}`,
      `Log level: ${chalk.cyan(this._logLevel)}`,
      `Watch enabled: ${chalk.cyan(this._server.watchEnabled)}`
    ];

    if (this._server.error) {
      header.unshift(
        chalk.red.bold(`There was an error restarting server: ${this._server.error.message}`)
      );
    }

    return header;
  }

  async displayMainMenu() {
    this._cli.clearScreen();
    const action = await this._cli.inquire("main");
    switch (action) {
      case "feature":
        return this.changeCurrentFeature();
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

  async changeCurrentFeature() {
    this._cli.clearScreen();
    const featuresNames = this._features.names;
    const feature = await this._cli.inquire("feature", {
      source: (answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(featuresNames);
        }
        return Promise.resolve(featuresNames.filter(feature => feature.includes(input)));
      }
    });
    this._features.current = feature;
    return this.displayMainMenu();
  }

  async changeDelay() {
    this._cli.clearScreen();
    const delay = await this._cli.inquire("delay");
    this._settings.delay = delay;
    return this.displayMainMenu();
  }

  async restartServer() {
    try {
      await this._server.restart();
      this._features = this._server.features;
    } catch (err) {}
    return this.displayMainMenu();
  }

  async switchWatch() {
    this._server.switchWatch(!this._server.watchEnabled);
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
      tracer.set("console", this._logLevel);
    });
    this.silentTraces();
    return this.displayMainMenu();
  }

  silentTraces() {
    tracer.set("console", "silent");
  }

  stopListeningServerWatch() {
    this._server.events.removeListener(WATCH_RELOAD, this.watchReloaded);
  }

  async initServer() {
    if (!this._serverInited) {
      this._serverInited = true;
      await this._server.start();
    }
    this.stopListeningServerWatch();
    this._server.events.on(WATCH_RELOAD, this.watchReloaded);
  }

  async start() {
    await this.initServer();
    this.silentTraces();
    return this.displayMainMenu();
  }
}

module.exports = Cli;
