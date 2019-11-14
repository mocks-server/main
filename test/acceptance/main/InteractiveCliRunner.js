const { CliRunner, wait } = require("./utils");

const LOG = "[CLI]: ";
const SCREEN_SEPARATOR = ">> Mocks server";

module.exports = class InteractiveCliRunner {
  constructor(cliArguments, cliOptions) {
    this._cli = new CliRunner(cliArguments, cliOptions);
  }

  _log(log) {
    console.log(`${LOG}${log}`);
  }

  async getCurrentScreen() {
    await wait(500);
    const allLogs = this._cli.allLogs;
    const lastLog = allLogs[allLogs.length - 1];
    return lastLog.includes(SCREEN_SEPARATOR)
      ? `${SCREEN_SEPARATOR}${lastLog.split(SCREEN_SEPARATOR).pop()}`
      : lastLog;
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

  get logs() {
    return this._cli.logs;
  }

  async cursorDown() {
    this._log("Moving cursor down");
    this._cli.cursorDown();
    await this.logCurrentSelection();
  }

  async pressEnter() {
    this._log("Pressing Enter");
    const newScreen = await this._cli.newScreenAfter(this._cli.pressEnter);
    await this.logCurrentSelection();
    return newScreen;
  }
};
