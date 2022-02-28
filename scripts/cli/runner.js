import spawn from "cross-spawn";

import { ensureArray } from "../common/utils.js";
import { ROOT_PATH } from "../common/paths.js";

const ENCODING_TYPE = "utf8";

class Logger {
  constructor({ silent = false } = {}) {
    this._silent = silent;
    this._logs = [];
    this.log = this.log.bind(this);
  }

  log(log) {
    const cleanLog = log.trim();
    if (cleanLog.length) {
      if (!this._silent) {
        console.log(cleanLog);
      }
      this._logs.push(cleanLog);
    }
  }

  get logs() {
    return this._logs;
  }

  get joinedLogs() {
    return this.logs.join("\n");
  }
}

export function CliRunner(command, prependCommands = []) {
  return function (commands, { stdio, cwd, silent, env } = {}) {
    const logData = new Logger({ silent });
    let npmProcess;
    return new Promise((resolve, reject) => {
      const commandsArray = ensureArray(commands);
      const processOptions = {
        cwd: cwd || ROOT_PATH,
        env: {
          FORCE_COLOR: true,
          ...process.env,
          ...env,
        },
      };

      if (stdio) {
        processOptions.stdio = stdio;
      }

      npmProcess = spawn(command, prependCommands.concat(commandsArray), processOptions);

      if (stdio !== "inherit") {
        npmProcess.stdin.setEncoding(ENCODING_TYPE);
        npmProcess.stdout.setEncoding(ENCODING_TYPE);
        npmProcess.stderr.setEncoding(ENCODING_TYPE);
        npmProcess.stdout.on("data", logData.log);
        npmProcess.stderr.on("data", logData.log);
      }

      npmProcess.on("close", (code) => {
        if (code !== 0) {
          reject();
        } else {
          resolve(logData.joinedLogs);
        }
      });
    });
  };
}
