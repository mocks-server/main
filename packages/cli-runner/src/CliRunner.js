const crossSpawn = require("cross-spawn");
const treeKill = require("tree-kill");

const { Logs, printLog } = require("./Logs");

const ENCODING_TYPE = "utf8";
const CTRL_C = "\u0003";

module.exports = class CliRunner {
  constructor(commandAndArguments, options = {}) {
    this._command = this._getCommandToExecute(commandAndArguments);
    this._cwd = options.cwd;
    this._logger = new Logs(options.logs);
    this._env = options.env;

    this._exitPromise = new Promise((resolve) => {
      this._resolveExitPromise = resolve;
    });

    this.waitUntilHasLogged = this._logger.waitUntilHasLogged.bind(this._logger);
    this.waitUntilNewScreenRendered = this._logger.waitUntilNewScreenRendered.bind(this._logger);

    this.run();
  }

  _getCommandToExecute(commandAndArguments) {
    return {
      name: commandAndArguments[0],
      params: commandAndArguments.splice(1, commandAndArguments.length - 1),
    };
  }

  run() {
    if (this._cliProcess) {
      throw new Error("Process is already running");
    } else {
      try {
        this._cliProcess = crossSpawn(this._command.name, this._command.params, {
          cwd: this._cwd,
          env: {
            ...process.env,
            ...this._env,
          },
        });
        this._cliProcess.stdin.setEncoding(ENCODING_TYPE);

        this._cliProcess.stdout.setEncoding(ENCODING_TYPE);
        this._cliProcess.stderr.setEncoding(ENCODING_TYPE);

        this._cliProcess.stdout.on("data", this._logger.log);
        this._cliProcess.stderr.on("data", this._logger.log);

        this._cliProcess.on("close", (code) => {
          this._exitCode = code;
          this._resolveExitPromise();
        });
      } catch (error) {
        printLog("Error starting process");
        printLog(error);
        this._exitCode = 1;
        this._resolveExitPromise();
      }
    }
  }

  async executeAndWaitUntilHasLogged(action, data, options) {
    const promise = this._logger.waitUntilHasLogged(data, options);
    await action();
    return promise;
  }

  async executeAndWaitUntilNewScreenRendered(action, options) {
    const promise = this._logger.waitUntilNewScreenRendered(options);
    await action();
    return promise;
  }

  write(data) {
    this._cliProcess.stdin.write(`${data}`);
  }

  pressEnter() {
    this.write("\n");
  }

  cursorUp(times = 0) {
    this.write("\u001b[A");
    if (times > 1) {
      this.cursorUp(times - 1);
    }
  }

  cursorDown(times = 0) {
    this.write("\u001b[B");
    if (times > 1) {
      this.cursorDown(times - 1);
    }
  }

  pressCtrlC() {
    this.write(CTRL_C);
  }

  async kill() {
    this._logger.stopWaits();
    if (this._cliProcess.pid) {
      treeKill(this._cliProcess.pid);
    }
    return this._exitPromise;
  }

  async hasExited() {
    return this._exitPromise;
  }

  get exitCode() {
    return this._exitCode;
  }

  get logs() {
    return this._logger;
  }
};
