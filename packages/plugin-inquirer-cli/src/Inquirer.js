/*
Copyright 2021 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const inquirer = require("inquirer");
const autocomplete = require("inquirer-autocomplete-prompt");
const { cloneDeep } = require("lodash");

const {
  renderSectionHeader,
  renderSectionFooter,
  renderLogsMode,
  clearScreen,
} = require("./helpers");

inquirer.registerPrompt("autocomplete", autocomplete);

const STDIN_ENCODING = "utf8";
const CTRL_C = "\u0003";

const EVENT_LISTENER = "keypress";
const STDIN_EVENT = "data";

const MAIN_MENU_ID = "main";
const DEFAULT_QUIT_NAME = "Exit";
const QUIT_ACTION_ID = "quit";

const QUIT_QUESTION = {
  name: DEFAULT_QUIT_NAME,
  value: QUIT_ACTION_ID,
};

const exitProcess = () => process.exit();

require("events").EventEmitter.defaultMaxListeners = 100;

const Inquirer = class Inquirer {
  constructor(header, alerts) {
    this._alertsHeader = alerts;
    this._header = header;

    this._exitLogsMode = this._exitLogsMode.bind(this);
    this._currentInquirers = new Set();
  }

  _initQuestions(questions) {
    const clonedQuestions = cloneDeep(questions);
    if (clonedQuestions[MAIN_MENU_ID] && clonedQuestions[MAIN_MENU_ID].choices) {
      clonedQuestions[MAIN_MENU_ID].choices.push(new inquirer.Separator());
      clonedQuestions[MAIN_MENU_ID].choices.push(QUIT_QUESTION);
    }
    return clonedQuestions;
  }

  set questions(questions) {
    this._questions = this._initQuestions(questions);
  }

  exitLogsMode() {
    if (this._logModeExit) {
      const stdin = process.stdin;
      if (stdin.setRawMode) {
        stdin.setRawMode(false);
      }
      stdin.pause();
      stdin.removeListener(STDIN_EVENT, this._exitLogsMode);
      this._logModeExit();
      delete this._logModeExit;
    }
  }

  _exitLogsMode(key) {
    if (key === CTRL_C) {
      process.exit();
    }
    this.exitLogsMode();
  }

  async logsMode(startLogs) {
    this.clearScreen();
    renderLogsMode();
    const stdin = process.stdin;
    if (stdin.setRawMode) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding(STDIN_ENCODING);
    stdin.on(STDIN_EVENT, this._exitLogsMode);
    if (startLogs) {
      startLogs();
    }
    return new Promise((resolve) => {
      this._logModeExit = resolve;
    });
  }

  _resolvePreviousInquirers() {
    this._currentInquirers.forEach((inquirerPromise) => {
      inquirerPromise(null);
      this._currentInquirers.delete(inquirerPromise);
    });
  }

  async inquire(questionKey, extendProperties) {
    this._resolvePreviousInquirers();
    this.removeListeners();
    return new Promise((resolve) => {
      this._currentInquirers.add(resolve);
      inquirer
        .prompt({
          ...this._questions[questionKey],
          ...extendProperties,
        })
        .then((answers) => {
          this._currentInquirers.delete(resolve);
          this.removeListeners();
          if (questionKey === MAIN_MENU_ID && answers.value === QUIT_ACTION_ID) {
            this.quit();
          }
          resolve(answers.value);
        });
    });
  }

  quit() {
    exitProcess();
  }

  clearScreen(opts) {
    const options = opts || {};
    clearScreen();
    if (options.header !== false) {
      const headers = (this._header && this._header()) || [];
      const alerts = (this._alertsHeader && this._alertsHeader()) || [];
      if (alerts.length) {
        renderSectionHeader(":warning:  ALERTS");
        alerts.forEach((alert) => console.log(alert));
        renderSectionFooter();
      }
      renderSectionHeader(":information_source:  CURRENT SETTINGS");
      headers.forEach((header) => console.log(header));
      renderSectionFooter();
      renderSectionHeader(":arrow_up_down:  ACTIONS");
    }
  }

  removeListeners() {
    const listeners = process.stdin.listeners(EVENT_LISTENER);
    listeners.forEach((listener) => {
      process.stdin.removeListener(EVENT_LISTENER, listener);
    });
  }
};

module.exports = {
  Inquirer,
};
