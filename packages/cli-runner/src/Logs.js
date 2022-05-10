const stripAnsi = require("strip-ansi");

const CLEAR_SCREEN_CHAR_REGEX = /\x1Bc/;
const NEW_LINE_CHAR = "\n";

function normalizePaths(str) {
  return str.replace(/\x1Bc/, "");
}

class Logs {
  constructor({
    silent = true,
    normalizePaths: normalizePathsOption = true,
    stripAnsi: stripAnsiOption = true,
  } = {}) {
    this._silent = silent;
    this._normalizePaths = normalizePathsOption;
    this._stripAnsi = stripAnsiOption;
    this._logs = [];
    this.log = this.log.bind(this);
  }

  _cleanLog(log) {
    let newLog = log.trim().replace(CLEAR_SCREEN_CHAR_REGEX, "");
    if (this._normalizePaths) {
      newLog = normalizePaths(log);
    }
    if (this._stripAnsi) {
      newLog = stripAnsi(log);
    }
    return newLog;
  }

  log(log) {
    const cleanLog = this._cleanLog(log);
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

  get joined() {
    return this._logs.join(NEW_LINE_CHAR);
  }

  flush() {
    this._logs = [];
  }
}

module.exports = Logs;
