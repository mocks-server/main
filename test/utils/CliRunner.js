/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const EventEmitter = require("events");
const childProcess = require("child_process");

const treeKillSync = require("tree-kill-sync");
const stripAnsi = require("strip-ansi");
const { isArray, isNumber } = require("lodash");

const ENCODING_TYPE = "utf8";
const CLRS = "\x1Bc";
const CTRL_C = "\u0003";
const LOG_EVENT_NAME = "logged";
const CLEAR_SCREEN_EVENT_NAME = "clearScreen";
const CLI_DEBUG = "[CLI-Runner] ------ ";

module.exports = class CliRunner {
  constructor(commandToExecute, options = {}) {
    this._eventEmitter = new EventEmitter();
    this._command = this.getCommandToExecute(commandToExecute);
    this._cwd = options.cwd || process.cwd();
    this._debug = options.debug === true;
    this._logs = [];
    this._allLogs = [];
    this.logData = this.logData.bind(this);
    this.write = this.write.bind(this);
    this.pressEnter = this.pressEnter.bind(this);
    this.cursorUp = this.cursorUp.bind(this);
    this.cursorDown = this.cursorDown.bind(this);
    this.pressCtrlC = this.pressCtrlC.bind(this);
    this._exitPromise = new Promise(resolve => {
      this._resolveExitPromise = resolve;
    });
    this.run();
  }

  getCommandToExecute(commandToExecute) {
    const commandIsArray = isArray(commandToExecute);
    const command = commandIsArray ? [...commandToExecute] : commandToExecute;
    return {
      name: commandIsArray ? command[0] : "node",
      params: commandIsArray ? command.splice(1, command.length - 1) : [command]
    };
  }

  logData(data) {
    if (data.includes(CLRS)) {
      this._eventEmitter.emit(CLEAR_SCREEN_EVENT_NAME, stripAnsi(data.split(CLRS)[1] || ""));
    }
    const cleanData = stripAnsi(data.replace(/\x1Bc/, ""));
    if (cleanData.length) {
      this._logs.push(cleanData);
      this._allLogs.push(data);
      this._eventEmitter.emit(LOG_EVENT_NAME, cleanData);
    }
  }

  run() {
    if (this._cliProcess) {
      throw new Error("Cli is already running");
    } else {
      this._cliProcess = childProcess.spawn(this._command.name, this._command.params, {
        cwd: this._cwd
      });
      this._cliProcess.stdin.setEncoding(ENCODING_TYPE);

      this._cliProcess.stdout.setEncoding(ENCODING_TYPE);
      this._cliProcess.stderr.setEncoding(ENCODING_TYPE);

      this._cliProcess.stdout.on("data", this.logData);
      this._cliProcess.stderr.on("data", this.logData);

      this._cliProcess.on("close", code => {
        this._exitCode = code;
        this._resolveExitPromise(true);
      });
    }
  }

  write(data) {
    this._cliProcess.stdin.write(`${data}`);
  }

  pressEnter() {
    this.write("\n");
  }

  cursorUp() {
    this.write("\u001b[A");
  }

  cursorDown() {
    this.write("\u001b[B");
  }

  pressCtrlC() {
    this.write(CTRL_C);
  }

  async kill() {
    treeKillSync(this._cliProcess.pid);
    return this._exitPromise;
  }

  async hasExit() {
    return this._exitPromise;
  }

  async hasPrinted(data, inputAction, inputTimeOut = 1000) {
    let timeOut = inputTimeOut;
    let action = inputAction;
    if (isNumber(action)) {
      timeOut = action;
      action = null;
    }
    let resolver;
    let rejecter;

    const timeout = setTimeout(() => {
      const errorMessage = `${data} was not printed after ${timeOut}ms`;
      console.log(errorMessage);
      rejecter(new Error(errorMessage));
    }, timeOut);

    const listener = logData => {
      if (logData.includes(data)) {
        this._eventEmitter.removeListener(LOG_EVENT_NAME, listener);
        clearTimeout(timeout);
        resolver();
      }
    };

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      this._eventEmitter.on(LOG_EVENT_NAME, listener);
      if (action) {
        action();
      }
    });
  }

  async newScreenAfter(action, timeOut = 1000) {
    let resolver;
    let rejecter;
    let screenLogs = [];
    let noLogsTimeout;
    let continuosLogsTriggered;
    let continuosLogsTimeout;

    const getScreenLogs = () => {
      const logs = screenLogs.join("");
      if (this._debug) {
        console.log(`${CLI_DEBUG} Screen:`);
        console.log(logs);
      }
      return logs;
    };

    const clearScreenTimeout = setTimeout(() => {
      const errorMessage = `No new screen was rendered after ${timeOut}ms`;
      console.log(errorMessage);
      this._eventEmitter.removeListener(CLEAR_SCREEN_EVENT_NAME, clearScreenListener);
      rejecter(new Error(errorMessage));
    }, timeOut);

    const startContinuosLogsTimeout = () => {
      continuosLogsTimeout = setTimeout(() => {
        continuosLogsTriggered = true;
        clearTimeout(noLogsTimeout);
        this._eventEmitter.removeListener(LOG_EVENT_NAME, logsListener);
        console.log(
          `Still receiving logs after 3000ms. Resolving promise with received data until now`
        );
        resolver(getScreenLogs());
      }, 3000);
    };

    const waitForNewLogs = () => {
      if (noLogsTimeout) {
        clearTimeout(noLogsTimeout);
      }
      noLogsTimeout = setTimeout(() => {
        this._eventEmitter.removeListener(LOG_EVENT_NAME, logsListener);
        clearTimeout(continuosLogsTimeout);
        resolver(getScreenLogs());
      }, 200);
    };

    const logsListener = logData => {
      screenLogs.push(logData);
      if (!continuosLogsTriggered) {
        waitForNewLogs();
      }
    };

    const clearScreenListener = logData => {
      if (this._debug) {
        console.log(`${CLI_DEBUG} New screen`);
      }
      clearTimeout(clearScreenTimeout);
      this._eventEmitter.removeListener(CLEAR_SCREEN_EVENT_NAME, clearScreenListener);
      this._eventEmitter.on(LOG_EVENT_NAME, logsListener);
      screenLogs.push(logData);
      startContinuosLogsTimeout();
      waitForNewLogs();
    };

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      this._eventEmitter.on(CLEAR_SCREEN_EVENT_NAME, clearScreenListener);
      action();
    });
  }

  flush() {
    this._logs = [];
  }

  get logs() {
    return this._logs.join("");
  }

  get allLogs() {
    return this._allLogs
      .join("")
      .split(CLRS)
      .map(stripAnsi);
  }

  get exitCode() {
    return this._exitCode;
  }
};
