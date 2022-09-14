/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { isNumber, debounce } = require("lodash");

const inquirer = require("./Inquirer");
const { renderHeader, renderAlert, getCurrentMockMessageLevel } = require("./helpers");

const MAIN_CHOICES = [
  {
    name: "Select collection",
    value: "collection",
  },
  {
    name: "Use route variant",
    value: "variant",
  },
  {
    name: "Restore route variants",
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
    name: "Display logs",
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
  collection: {
    type: "autocomplete",
    name: "value",
    message: "Please choose collection",
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
  COLLECTION: "collection",
  DELAY: "delay",
  LOG_LEVEL: "log-level",
  LOGS: "logs",
};

const OPTIONS = [
  {
    name: "enabled",
    description: "Start interactive CLI or not",
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

  constructor({ config, alerts, mock, server }) {
    this._alerts = alerts;
    this._server = server;
    this._config = config;
    this._mock = mock;

    this._inited = false;
    this._started = false;
    this._currentScreen = null;

    this._onChangeOptionEmojis = this._onChangeOptionEmojis.bind(this);
    this._onChangeOptionCli = this._onChangeOptionCli.bind(this);
    this._onChangeOptionLog = this._onChangeOptionLog.bind(this);
    this._refreshMenuIfStarted = debounce(this._refreshMenuIfStarted.bind(this), 200, {
      maxWait: 1000,
    });

    this._optionCli = this._config.addOption(OPTIONS[0]);
    this._optionEmojis = this._config.addOption(OPTIONS[1]);

    this._optionLog = this._config.root.option("log");
    this._optionCollection = this._config.root
      .namespace("mock")
      .namespace("collections")
      .option("selected");
    this._optionDelay = this._config.root.namespace("mock").namespace("routes").option("delay");
    this._optionPort = this._config.root.namespace("server").option("port");
    this._optionHost = this._config.root.namespace("server").option("host");
    this._optionHttps = this._config.root.namespace("server").namespace("https").option("enabled");
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
    this._optionCollection.onChange(this._refreshMenuIfStarted);
    this._optionDelay.onChange(this._refreshMenuIfStarted);
    this._optionPort.onChange(this._refreshMenuIfStarted);
    this._optionHost.onChange(this._refreshMenuIfStarted);
    this._optionWatch.onChange(this._refreshMenuIfStarted);
    this._optionEmojis.onChange(this._onChangeOptionEmojis);
    this._optionHttps.onChange(this._refreshMenuIfStarted);

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
    this._stopListeningChangeAlerts = this._alerts.root.onChange(this._refreshMenuIfStarted);
    this._stopListeningChangeMocks = this._mock.onChange(this._refreshMenuIfStarted);
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
    const protocol = this._optionHttps.value === true ? "https" : "http";
    return `${protocol}://${host}:${this._optionPort.value}`;
  }

  _header() {
    const delay = this._optionDelay.value;
    const watchEnabled = this._optionWatch.value;

    const currentCollection = this._mock.collections.selected || "-";
    const availableCollections = this._mock.collections.plain.length;
    const availableRoutes = this._mock.routes.plain.length;
    const availableRoutesVariants = this._mock.routes.plainVariants.length;

    const currentCollectionMessage = this._mock.customRouteVariants.length
      ? `${currentCollection} (custom variants: ${this._mock.customRouteVariants.join(",")})`
      : currentCollection;

    return [
      renderHeader(`Server listening at`, this._serverUrl),
      renderHeader(`Delay`, delay, delay > 0 ? 1 : 0),
      renderHeader(
        `Current collection`,
        currentCollectionMessage,
        getCurrentMockMessageLevel(this._mock.customRouteVariants, currentCollection)
      ),
      renderHeader(`Collections`, availableCollections, availableCollections < 1 ? 2 : 0),
      renderHeader(`Routes`, availableRoutes, availableRoutes < 1 ? 2 : 0),
      renderHeader(`Route variants`, availableRoutesVariants, availableRoutesVariants < 1 ? 2 : 0),
      renderHeader(`Log level`, this._logLevel),
      renderHeader(`Watch enabled`, watchEnabled, !!watchEnabled ? 0 : 1),
    ];
  }

  _alertsHeader() {
    return this._alerts.root.flat.map(renderAlert);
  }

  async _displayMainMenu() {
    this._cli.questions = getQuestions();
    this._cli.clearScreen();
    this._cli.exitLogsMode();
    this._currentScreen = SCREENS.MAIN;
    const action = await this._cli.inquire("main");
    switch (action) {
      case "collection":
        return this._changeCurrentCollection();
      case "variant":
        return this._changeRouteVariant();
      case "restoreVariants":
        return this._restoreRouteVariants();
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

  async _changeCurrentCollection() {
    this._currentScreen = SCREENS.COLLECTION;
    this._cli.clearScreen();
    const collectionsIds = this._mock.collections.ids;
    if (!collectionsIds.length) {
      return this._displayMainMenu();
    }
    const collectionId = await this._cli.inquire("collection", {
      source: (_answers, input) => {
        if (!input || !input.length) {
          return Promise.resolve(collectionsIds);
        }
        return Promise.resolve(
          collectionsIds.filter((currentCollection) => currentCollection.includes(input))
        );
      },
    });
    this._optionCollection.value = collectionId;
    return this._displayMainMenu();
  }

  async _changeRouteVariant() {
    this._currentScreen = SCREENS.COLLECTION;
    this._cli.clearScreen();
    const routeVariantsIds = this._mock.routes.plainVariants.map((variant) => variant.id);
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
    this._mock.useRouteVariant(variantId);
    return this._displayMainMenu();
  }

  async _restoreRouteVariants() {
    this._mock.restoreRouteVariants();
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
      await this._server.restart();
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
