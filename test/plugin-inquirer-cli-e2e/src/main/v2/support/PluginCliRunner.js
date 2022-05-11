/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const CliRunner = require("@mocks-server/cli-runner");

const LOG = "[CLI]: ";

module.exports = class InteractiveCliRunner {
  constructor(cliArguments, cliOptions, wait) {
    this._wait = wait;
    this._cli = new CliRunner(cliArguments, cliOptions);
  }

  _log(log) {
    console.log(`${LOG}${log}`);
  }

  async getCurrentScreen() {
    await this._wait(500);
    return this._cli.logs.currentScreen;
  }

  async logCurrentScreen() {
    this._log(`Current screen:\n${await this.getCurrentScreen()}`);
    this._log("----------------");
  }

  async getCurrentSelection() {
    const screen = await this.getCurrentScreen();
    const splitted = screen.split("❯");
    const lastAction = splitted[splitted.length - 1];
    return lastAction.split("\n")[0];
  }

  async logCurrentSelection() {
    this._log(`Current selection: ❯ ${await this.getCurrentSelection()}`);
  }

  kill() {
    return this._cli.kill();
  }

  flush() {
    this._cli.logs.flushCurrent();
  }

  get logs() {
    return this._cli.logs.current;
  }

  get currentScreen() {
    return this._cli.logs.currentScreen;
  }

  async cursorDown(number) {
    this._log("Moving cursor down");
    this._cli.cursorDown();
    await this.logCurrentSelection();
    if (number > 1) {
      await this.cursorDown(number - 1);
    }
  }

  async pressEnter() {
    this._log("Pressing Enter");
    const newScreen = await this._cli.executeAndWaitUntilNewScreenRendered(
      this._cli.pressEnter.bind(this._cli)
    );
    await this.logCurrentSelection();
    return newScreen;
  }

  write(data) {
    this._log(`Writing: "${data}"`);
    this._cli.write(data);
  }
};
