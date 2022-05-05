/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const path = require("path");
const crossSpawn = require("cross-spawn");

const treeKill = require("tree-kill");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";

const cwdPath = path.resolve(__dirname, "..", "fixtures");

module.exports = class MocksRunner {
  constructor(commandToExecute, options = {}) {
    this._command = this.getCommandToExecute(commandToExecute);
    this._cwd = options.cwd || cwdPath;
    this._logs = [];

    this._exitPromise = new Promise((resolve) => {
      this._resolveExitPromise = resolve;
    });

    this.logData = this.logData.bind(this);

    this.run();
  }

  getCommandToExecute(command) {
    return {
      name: command[0],
      params: command.splice(1, command.length - 1),
    };
  }

  logData(data) {
    const cleanData = stripAnsi(data.replace(/\x1Bc/, ""));
    if (cleanData.length) {
      console.log(cleanData);
      this._logs.push(cleanData);
    }
  }

  run() {
    if (this._cliProcess) {
      throw new Error("Cli is already running");
    } else {
      this._cliProcess = crossSpawn(this._command.name, this._command.params, {
        cwd: this._cwd,
      });
      this._cliProcess.stdin.setEncoding(ENCODING_TYPE);

      this._cliProcess.stdout.setEncoding(ENCODING_TYPE);
      this._cliProcess.stderr.setEncoding(ENCODING_TYPE);

      this._cliProcess.stdout.on("data", this.logData);
      this._cliProcess.stderr.on("data", this.logData);

      this._cliProcess.on("close", (code) => {
        this._exitCode = code;
        this._resolveExitPromise(true);
      });
    }
  }

  async kill() {
    treeKill(this._cliProcess.pid);
    return this._exitPromise;
  }

  async hasExit() {
    return this._exitPromise;
  }

  flush() {
    this._logs = [];
  }

  get logs() {
    return this._logs.join("").replace(/\\/gim, "/");
  }

  get exitCode() {
    return this._exitCode;
  }
};
