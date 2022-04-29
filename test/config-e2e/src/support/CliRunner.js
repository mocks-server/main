const crossSpawn = require("cross-spawn");

const treeKill = require("tree-kill");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";
const CLEAR_SCREEN_CHAR_REGEX = /\x1Bc/;
const NEW_LINE_CHAR = "\n";

class Logger {
  constructor({ silent = true } = {}) {
    this._silent = silent;
    this._logs = [];
    this.log = this.log.bind(this);
  }

  log(log) {
    const cleanLog = stripAnsi(log.trim().replace(CLEAR_SCREEN_CHAR_REGEX, ""));
    if (cleanLog.length) {
      if (!this._silent) {
        console.log(cleanLog);
      }
      this._logs.push(cleanLog);
    }
  }

  get items() {
    return this._logs;
  }

  get join() {
    return this._logs.join(NEW_LINE_CHAR);
  }

  flush() {
    this._logs = [];
  }
}

module.exports = class CliRunner {
  constructor(commandAndArguments, options = {}) {
    this._command = this.getCommandToExecute(commandAndArguments);
    this._cwd = options.cwd;
    this._logger = new Logger({ silent: options.silent });
    this._env = options.env;

    this._exitPromise = new Promise((resolve) => {
      this._resolveExitPromise = resolve;
    });

    this.run();
  }

  getCommandToExecute(commandAndArguments) {
    return {
      name: commandAndArguments[0],
      params: commandAndArguments.splice(1, commandAndArguments.length - 1),
    };
  }

  run() {
    if (this._cliProcess) {
      throw new Error("Cli is already running");
    } else {
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
        this._resolveExitPromise(true);
      });
    }
  }

  async kill() {
    treeKill(this._cliProcess.pid);
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
