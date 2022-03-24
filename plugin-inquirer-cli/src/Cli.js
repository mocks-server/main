/*
Copyright 2019 Javier Brea
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
  {
    name: "Legacy: Change behavior",
    value: "behavior",
    isLegacy: true,
  },
  {
    name: "Legacy: Switch watch",
    value: "watchLegacy",
    isLegacy: true,
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
  behavior: {
    type: "autocomplete",
    name: "value",
    message: "Please choose behavior",
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

const mainChoices = (legacyMode) => {
  return MAIN_CHOICES.filter((choice) => !(choice.isLegacy && !legacyMode));
};

const getQuestions = (legacyMode) => {
  const questions = QUESTIONS;
  questions.main.choices = mainChoices(legacyMode);
  return questions;
};

const SCREENS = {
  MAIN: "main",
  BEHAVIOR: "behavior",
  MOCK: "mock",
  DELAY: "delay",
  LOG_LEVEL: "log-level",
  LOGS: "logs",
};

class Cli {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = core.settings;
    this._inited = false;
    this._started = false;
    this._currentScreen = null;

    this._onChangeMocks = this._onChangeMocks.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
    this._onChangeAlerts = this._onChangeAlerts.bind(this);

    this._core.addSetting({
      name: "cli",
      type: "boolean",
      description: "Start interactive CLI plugin",
      default: true,
    });
  }

  init() {
    if (!this._settings.get("cli")) {
      return Promise.resolve();
    }
    this._cli = new inquirer.Inquirer(this._header.bind(this), this._alertsHeader.bind(this));
    this._stopListeningChangeSettings = this._core.onChangeSettings(this._onChangeSettings);
    this._inited = true;
    return Promise.resolve();
  }

  async start() {
    if (!this._inited) {
      await this.init();
    }
    if (!this._settings.get("cli") || this._started) {
      return Promise.resolve();
    }
    this._started = true;
    if (this._stopListeningChangeMocks) {
      this._stopListeningChangeMocks();
      this._stopListeningChangeLegacyMocks();
      this._stopListeningChangeAlerts();
    }
    this._stopListeningChangeAlerts = this._core.onChangeAlerts(this._onChangeAlerts);
    this._stopListeningChangeMocks = this._core.onChangeMocks(this._onChangeMocks);
    this._stopListeningChangeLegacyMocks = this._core.onChangeLegacyMocks(this._onChangeMocks);
    this._logLevel = this._settings.get("log");
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
    this._stopListeningChangeLegacyMocks();
    this._stopListeningChangeAlerts();
    this._settings.set("log", this._logLevel);
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

  _onChangeMocks() {
    return this._refreshMainMenu();
  }

  _onChangeSettings(newSettings) {
    if (this._started) {
      if (newSettings.hasOwnProperty("cli") && newSettings.cli === false) {
        return this.stop();
      }
      if (newSettings.hasOwnProperty("log")) {
        if (!this._isOverwritingLogLevel) {
          this._logLevel = newSettings.log;
          if (this._currentScreen !== SCREENS.LOGS) {
            this._silentTraces();
          }
        } else {
          this._isOverwritingLogLevel = false;
        }
      }
      if (
        newSettings.hasOwnProperty("mock") ||
        newSettings.hasOwnProperty("delay") ||
        newSettings.hasOwnProperty("host") ||
        newSettings.hasOwnProperty("log") ||
        newSettings.hasOwnProperty("watch") ||
        // To be deprecated
        newSettings.hasOwnProperty("watchLegacy") ||
        newSettings.hasOwnProperty("behavior")
      ) {
        return this._refreshMainMenu();
      }
    } else if (newSettings.hasOwnProperty("cli") && newSettings.cli === true) {
      return this.start();
    }
  }

  _onChangeAlerts() {
    return this._refreshMainMenu();
  }

  get _serverUrl() {
    const hostSetting = this._settings.get("host");
    const host = hostSetting === "0.0.0.0" ? "localhost" : hostSetting;
    return `http://${host}:${this._settings.get("port")}`;
  }

  _header() {
    const delay = this._settings.get("delay");
    const watchLegacyEnabled = this._settings.get("watchLegacy");
    const watchEnabled = this._settings.get("watch");
    const legacyMode = !!this._settings.get("pathLegacy");

    const currentMock = this._core.mocks.current || "-";
    const behaviorsCount = this._core.behaviors.count;
    const currentBehavior = this._core.behaviors.currentId || "-";
    const currentFixtures = this._core.fixtures.count;
    const availableMocks = this._core.mocks.plainMocks.length;
    const availableRoutes = this._core.mocks.plainRoutes.length;
    const availableRoutesVariants = this._core.mocks.plainRoutesVariants.length;

    const currentMockMessage = this._core.mocks.customRoutesVariants.length
      ? `${currentMock} (custom variants: ${this._core.mocks.customRoutesVariants.join(",")})`
      : currentMock;

    const headers = [
      renderHeader(`Mocks server listening at`, this._serverUrl),
      renderHeader(`Delay`, delay, delay > 0 ? 1 : 0),
      renderHeader(
        `Current mock`,
        currentMockMessage,
        getCurrentMockMessageLevel(this._core.mocks.customRoutesVariants, currentMock)
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

    const legacyHeaders = legacyMode
      ? [
          renderHeader(`Legacy: Watch enabled`, watchLegacyEnabled, !!watchLegacyEnabled ? 0 : 1),
          renderHeader(`Legacy: behaviors`, behaviorsCount, behaviorsCount < 1 ? 2 : 0),
          renderHeader(
            `Legacy: Current behavior`,
            currentBehavior,
            currentBehavior === "-" ? 2 : 0
          ),
          renderHeader(`Legacy: Current fixtures`, currentFixtures, currentFixtures < 1 ? 2 : 0),
        ]
      : [];

    return [...headers, ...legacyHeaders];
  }

  _alertsHeader() {
    return this._core.alerts.map(renderAlert);
  }

  async _displayMainMenu() {
    this._cli.questions = getQuestions(!!this._settings.get("pathLegacy"));
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
      // Legacy, to be removed
      case "behavior":
        return this._changeCurrentBehavior();
      case "watchLegacy":
        return this._switchWatchLegacy();
    }
  }

  async _changeCurrentMock() {
    this._currentScreen = SCREENS.MOCK;
    this._cli.clearScreen();
    const mocksIds = this._core.mocks.ids;
    if (!mocksIds.length) {
      return this._displayMainMenu();
    }
    const mockId = await this._cli.inquire("mock", {
      source: (answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(mocksIds);
        }
        return Promise.resolve(mocksIds.filter((currentMock) => currentMock.includes(input)));
      },
    });
    this._settings.set("mock", mockId);
    return this._displayMainMenu();
  }

  async _changeRouteVariant() {
    this._currentScreen = SCREENS.MOCK;
    this._cli.clearScreen();
    const routeVariantsIds = this._core.mocks.plainRoutesVariants.map((variant) => variant.id);
    if (!routeVariantsIds.length) {
      return this._displayMainMenu();
    }
    const variantId = await this._cli.inquire("variant", {
      source: (answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(routeVariantsIds);
        }
        return Promise.resolve(routeVariantsIds.filter((variant) => variant.includes(input)));
      },
    });
    this._core.mocks.useRouteVariant(variantId);
    return this._displayMainMenu();
  }

  async _restoreRoutesVariants() {
    this._core.mocks.restoreRoutesVariants();
    return this._displayMainMenu();
  }

  async _changeCurrentBehavior() {
    this._currentScreen = SCREENS.BEHAVIOR;
    this._cli.clearScreen();
    const behaviorsIds = this._core.behaviors.ids;
    if (!behaviorsIds.length) {
      return this._displayMainMenu();
    }
    const behavior = await this._cli.inquire("behavior", {
      source: (answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(behaviorsIds);
        }
        return Promise.resolve(
          behaviorsIds.filter((currentBehavior) => currentBehavior.includes(input))
        );
      },
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
      await this._core.restartServer();
    } catch (err) {}
    return this._displayMainMenu();
  }

  async _switchWatch() {
    this._settings.set("watch", !this._settings.get("watch"));
    return this._displayMainMenu();
  }

  async _switchWatchLegacy() {
    this._settings.set("watchLegacy", !this._settings.get("watchLegacy"));
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
    this._isOverwritingLogLevel = true;
    this._settings.set("log", "silent");
  }

  get displayName() {
    return "@mocks-server/plugin-inquirer-cli";
  }
}

module.exports = Cli;
