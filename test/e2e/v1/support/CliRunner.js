/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const childProcess = require("child_process");

const treeKillSync = require("tree-kill-sync");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";

module.exports = class CliRunner {
  constructor(commandToExecute, options = {}) {
    this._command = this.getCommandToExecute(commandToExecute);
    this._cwd = options.cwd || process.cwd();
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
      this._logs.push(cleanData);
    }
  }

  run() {
    if (this._cliProcess) {
      throw new Error("Cli is already running");
    } else {
      console.log("----------------------CWD", this._cwd);
      this._cliProcess = childProcess.spawn(
        this._command.name,
        this._command.params.concat(["--no-watch"]),
        {
          cwd: this._cwd,
        }
      );
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
    treeKillSync(this._cliProcess.pid);
    return this._exitPromise;
  }

  async hasExit() {
    return this._exitPromise;
  }

  flush() {
    this._logs = [];
  }

  get logs() {
    return this._logs.join("");
  }

  get exitCode() {
    return this._exitCode;
  }
};
