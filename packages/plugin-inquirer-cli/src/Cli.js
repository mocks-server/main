/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { isNumber } = require("lodash");

const inquirer = require("./Inquirer");
const { renderHeader, renderAlert, getCurrentMockMessageLevel } = require("./helpers");

const MAIN_CHOICES = [
  {
    name: "Change current mock",
    value: "mock",
  },
  {
    name: "Change route variant",
    value: "variant",
  },
  {
    name: "Restore routes variants",
    value: "restoreVariants",
  },
  {
    name: "Change delay",
    value: "delay",
  },
  {
    name: "Restart server",
    value: "restart",
  },
  {
    name: "Change log level",
    value: "logLevel",
  },
  {
    name: "Switch watch",
    value: "watch",
  },
  {
    name: "Display server logs",
    value: "logs",
  },
];

const QUESTIONS = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: MAIN_CHOICES,
  },
  logLevel: {
    type: "list",
    message: "Select log level:",
    name: "value",
    choices: ["silly", "debug", "verbose", "info", "warn", "error"],
  },
  mock: {
    type: "autocomplete",
    name: "value",
    message: "Please choose mock",
  },
  variant: {
    type: "autocomplete",
    name: "value",
    message: "Please choose route variant",
  },
  delay: {
    type: "input",
    name: "value",
    message: "Enter delay time in ms:",
    validate: (value) => isNumber(value),
    filter: (value) => {
      if (/^\d*$/.test(value)) {
        return parseInt(value, 10);
      }
      return false;
    },
  },
};

const mainChoices = () => {
  return MAIN_CHOICES;
};

const getQuestions = () => {
  const questions = QUESTIONS;
  questions.main.choices = mainChoices();
  return questions;
};

const SCREENS = {
  MAIN: "main",
  MOCK: "mock",
  DELAY: "delay",
  LOG_LEVEL: "log-level",
  LOGS: "logs",
};

const OPTIONS = [
  {
    name: "enabled",
    description: "Start interactive CLI plugin or not",
    type: "boolean",
    default: true,
  },
  {
    name: "emojis",
    description: "Render emojis or not",
    type: "boolean",
    default: true,
  },
];

class Cli {
  static get id() {
    return "inquirerCli";
  }

  constructor({ config, alerts, mocks, onChangeAlerts, onChangeMocks, restartServer }) {
    this._alerts = alerts;
    this._restartServerMethod = restartServer;
    this._config = config;
    this._mocks = mocks;
    this._onChangeAlerts = onChangeAlerts;
    this._onChangeMocks = onChangeMocks;
    this._inited = false;
    this._started = false;
    this._currentScreen = null;

    this._onChangeOptionEmojis = this._onChangeOptionEmojis.bind(this);
    this._onChangeOptionCli = this._onChangeOptionCli.bind(this);
    this._onChangeOptionLog = this._onChangeOptionLog.bind(this);
    this._refreshMenuIfStarted = this._refreshMenuIfStarted.bind(this);

    this._optionCli = this._config.addOption(OPTIONS[0]);
    this._optionEmojis = this._config.addOption(OPTIONS[1]);

    this._optionLog = this._config.root.option("log");
    this._optionMock = this._config.root.namespace("mocks").option("selected");
    this._optionDelay = this._config.root.namespace("mocks").option("delay");
    this._optionPort = this._config.root.namespace("server").option("port");
    this._optionHost = this._config.root.namespace("server").option("host");
    this._optionWatch = this._config.root.namespace("files").option("watch");
  }

  init() {
    if (!this._optionCli.value) {
      return Promise.resolve();
    }
    this._cli = new inquirer.Inquirer(this._header.bind(this), this._alertsHeader.bind(this), {
      emojis: this._optionEmojis.value,
    });

    this._optionCli.onChange(this._onChangeOptionCli);
    this._optionLog.onChange(this._onChangeOptionLog);
    this._optionMock.onChange(this._refreshMenuIfStarted);
    this._optionDelay.onChange(this._refreshMenuIfStarted);
    this._optionHost.onChange(this._refreshMenuIfStarted);
    this._optionWatch.onChange(this._refreshMenuIfStarted);
    this._optionEmojis.onChange(this._onChangeOptionEmojis);

    this._inited = true;
    return Promise.resolve();
  }

  async start() {
    if (!this._inited) {
      await this.init();
    }
    if (!this._optionCli.value || this._started) {
      return Promise.resolve();
    }
    this._started = true;
    this._stopListeningChangeAlerts = this._onChangeAlerts(this._refreshMenuIfStarted);
    this._stopListeningChangeMocks = this._onChangeMocks(this._refreshMenuIfStarted);
    this._logLevel = this._optionLog.value;
    this._silentTraces();
    this._displayMainMenu();
    return Promise.resolve();
  }

  stop() {
    if (!this._started) {
      return Promise.resolve();
    }
    this._started = false;
    this._stopListeningChangeMocks();
    this._stopListeningChangeAlerts();
    this._stopListeningChangeMocks = null;
    this._stopListeningChangeAlerts = null;

    this._optionLog.value = this._logLevel;
    this._cli.logsMode();
    this._cli.clearScreen({
      header: false,
    });
    return Promise.resolve();
  }

  _refreshMainMenu() {
    if (this._currentScreen === SCREENS.MAIN) {
      return this._displayMainMenu();
    }
    return Promise.resolve();
  }

  _onChangeOptionCli(enabled) {
    if (this._started && !enabled) {
      return this.stop();
    } else if (!this._started && !!enabled) {
      return this.start();
    }
  }

  _onChangeOptionEmojis(enabled) {
    this._cli.emojis = enabled;
    this._refreshMenuIfStarted();
  }

  _onChangeOptionLog(log) {
    if (this._started) {
      if (!this._isOverwritingLogLevel) {
        this._logLevel = log;
        if (this._currentScreen !== SCREENS.LOGS) {
          this._silentTraces();
        }
      } else {
        this._isOverwritingLogLevel = false;
      }
      return this._refreshMainMenu();
    }
  }

  _refreshMenuIfStarted() {
    if (this._started) {
      return this._refreshMainMenu();
    }
  }

  get _serverUrl() {
    const hostSetting = this._optionHost.value;
    const host = hostSetting === "0.0.0.0" ? "localhost" : hostSetting;
    return `http://${host}:${this._optionPort.value}`;
  }

  _header() {
    const delay = this._optionDelay.value;
    const watchEnabled = this._optionWatch.value;

    const currentMock = this._mocks.current || "-";
    const availableMocks = this._mocks.plainMocks.length;
    const availableRoutes = this._mocks.plainRoutes.length;
    const availableRoutesVariants = this._mocks.plainRoutesVariants.length;

    const currentMockMessage = this._mocks.customRoutesVariants.length
      ? `${currentMock} (custom variants: ${this._mocks.customRoutesVariants.join(",")})`
      : currentMock;

    return [
      renderHeader(`Mocks server listening at`, this._serverUrl),
      renderHeader(`Delay`, delay, delay > 0 ? 1 : 0),
      renderHeader(
        `Current mock`,
        currentMockMessage,
        getCurrentMockMessageLevel(this._mocks.customRoutesVariants, currentMock)
      ),
      renderHeader(`Mocks`, availableMocks, availableMocks < 1 ? 2 : 0),
      renderHeader(`Routes`, availableRoutes, availableRoutes < 1 ? 2 : 0),
      renderHeader(
        `Routes variants`,
        availableRoutesVariants,
        availableRoutesVariants < 1 ? 2 : 0
      ),
      renderHeader(`Log level`, this._logLevel),
      renderHeader(`Watch enabled`, watchEnabled, !!watchEnabled ? 0 : 1),
    ];
  }

  _alertsHeader() {
    return this._alerts.root.customFlat.map(renderAlert);
  }

  async _displayMainMenu() {
    this._cli.questions = getQuestions();
    this._cli.clearScreen();
    this._cli.exitLogsMode();
    this._currentScreen = SCREENS.MAIN;
    const action = await this._cli.inquire("main");
    switch (action) {
      case "mock":
        return this._changeCurrentMock();
      case "variant":
        return this._changeRouteVariant();
      case "restoreVariants":
        return this._restoreRoutesVariants();
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

  async _changeCurrentMock() {
    this._currentScreen = SCREENS.MOCK;
    this._cli.clearScreen();
    const mocksIds = this._mocks.ids;
    if (!mocksIds.length) {
      return this._displayMainMenu();
    }
    const mockId = await this._cli.inquire("mock", {
      source: (_answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(mocksIds);
        }
        return Promise.resolve(mocksIds.filter((currentMock) => currentMock.includes(input)));
      },
    });
    this._optionMock.value = mockId;
    return this._displayMainMenu();
  }

  async _changeRouteVariant() {
    this._currentScreen = SCREENS.MOCK;
    this._cli.clearScreen();
    const routeVariantsIds = this._mocks.plainRoutesVariants.map((variant) => variant.id);
    if (!routeVariantsIds.length) {
      return this._displayMainMenu();
    }
    const variantId = await this._cli.inquire("variant", {
      source: (_answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(routeVariantsIds);
        }
        return Promise.resolve(routeVariantsIds.filter((variant) => variant.includes(input)));
      },
    });
    this._mocks.useRouteVariant(variantId);
    return this._displayMainMenu();
  }

  async _restoreRoutesVariants() {
    this._mocks.restoreRoutesVariants();
    return this._displayMainMenu();
  }

  async _changeDelay() {
    this._currentScreen = SCREENS.DELAY;
    this._cli.clearScreen();
    const delay = await this._cli.inquire("delay");
    this._optionDelay.value = delay;
    return this._displayMainMenu();
  }

  async _restartServer() {
    try {
      await this._restartServerMethod();
    } catch (err) {}
    return this._displayMainMenu();
  }

  async _switchWatch() {
    this._optionWatch.value = !this._optionWatch.value;
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
      this._optionLog.value = this._logLevel;
    });
    this._silentTraces();
    return this._displayMainMenu();
  }

  _silentTraces() {
    this._isOverwritingLogLevel = true;
    this._optionLog.value = "silent";
  }
}

module.exports = Cli;
