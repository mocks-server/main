const EventEmitter = require("events");

const stripAnsi = require("strip-ansi");

const CLEAR_SCREEN_CHAR = "\x1Bc";
const LOG_EVENT_NAME = "log";
const CLEAR_SCREEN_EVENT_NAME = "clearScreen";
const STOP_WAITS_EVENT_NAME = "stop";

const NEW_LINE_CHAR = "\n";

function normalizePaths(str) {
  return str.replace(/\x1Bc/, ""); // TODO, fix
}

class Logs {
  constructor({
    silent = true,
    normalizePaths: normalizePathsOption = true,
    stripAnsi: stripAnsiOption = true,
  } = {}) {
    this._eventEmitter = new EventEmitter();

    this._silent = silent;
    this._normalizePaths = normalizePathsOption;
    this._stripAnsi = stripAnsiOption;

    this._screens = [];
    this._currentScreenLogs = [];
    this._allLogs = [];
    this._lines = [];

    this.log = this.log.bind(this);
  }

  _cleanLog(log) {
    let newLog = log.trim();
    if (this._normalizePaths) {
      newLog = normalizePaths(log);
    }
    if (this._stripAnsi) {
      newLog = stripAnsi(log);
    }
    return newLog;
  }

  _logLine(log) {
    const cleanLog = this._cleanLog(log);
    if (cleanLog.length) {
      if (!this._silent) {
        console.log(cleanLog);
      }
      this._currentScreenLogs.push(cleanLog);
      this._lines.push(cleanLog);
      this._eventEmitter.emit(LOG_EVENT_NAME, cleanLog);
    }
  }

  _logLines(log) {
    const lines = log.split(NEW_LINE_CHAR);
    lines.forEach((lineLog) => {
      this._logLine(lineLog);
    });
  }

  _logScreens(log) {
    const screens = log.split(CLEAR_SCREEN_CHAR);
    screens.forEach((screenLog, index) => {
      if (index > 0) {
        if (this._currentScreenLogs.length > 0) {
          this._screens.push(this._currentScreenLogs);
        }
        this._currentScreenLogs = [];
        this._eventEmitter.emit(CLEAR_SCREEN_EVENT_NAME);
      }
      this._logLines(screenLog);
    });
  }

  log(log) {
    this._logScreens(log);
  }

  async waitUntilHasLogged(data, { timeout: timeoutOption = 2000 } = {}) {
    let resolver;
    let rejecter;

    const removeListeners = () => {
      clearTimeout(timeout);
      this._eventEmitter.removeListener(LOG_EVENT_NAME, listener);
      this._eventEmitter.removeListener(STOP_WAITS_EVENT_NAME, stop);
    };

    const stopAndResolve = () => {
      removeListeners();
      resolver();
    };

    const stopAndReject = (error) => {
      removeListeners();
      rejecter(error);
    };

    const timeout = setTimeout(() => {
      const errorMessage = `${data} was not printed after ${timeoutOption}ms`;
      console.log(errorMessage);
      stopAndReject(new Error(errorMessage));
    }, timeoutOption);

    const listener = (logData) => {
      if (logData.includes(data)) {
        stopAndResolve();
      }
    };

    const stop = () => {
      stopAndResolve();
    };

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      this._eventEmitter.on(STOP_WAITS_EVENT_NAME, stop);
      this._eventEmitter.on(LOG_EVENT_NAME, listener);
    });
  }

  async waitUntilNewScreenRendered({
    newScreenTimeout: newScreenTimeoutLimit = 2000, // Reject if no new screen is received after this time
    screenRenderedTimeout: screenRenderedTimeoutLimit = 3000, // New screen is considered rendered after this time if it continues receiving logs
    screenIsRenderedAfterSilent = 200, // New screen is considered rendered after this time without receiving logs
    screensLimit = 2, // If multiple new screens are received while waiting until screen is considered rendered, return this one and stop
  } = {}) {
    let resolver;
    let rejecter;
    let newScreenTimeout;
    let screenRenderedTimeout;
    let forceScreenRenderedTimeout;
    let screens = 0;

    const removeListeners = () => {
      if (forceScreenRenderedTimeout) {
        clearTimeout(forceScreenRenderedTimeout);
      }
      if (screenRenderedTimeout) {
        clearTimeout(screenRenderedTimeout);
      }
      if (newScreenTimeout) {
        clearTimeout(screenRenderedTimeout);
      }
      this._eventEmitter.removeListener(CLEAR_SCREEN_EVENT_NAME, onNewScreen);
      this._eventEmitter.removeListener(LOG_EVENT_NAME, onNewLine);
      this._eventEmitter.removeListener(STOP_WAITS_EVENT_NAME, stop);
    };

    const stopAndResolve = () => {
      removeListeners();
      resolver(this.currentScreen);
    };

    const stopAndReject = (error) => {
      removeListeners();
      rejecter(error);
    };

    newScreenTimeout = setTimeout(() => {
      stopAndReject(new Error(`No new screen was rendered after ${newScreenTimeoutLimit}ms`));
    }, newScreenTimeoutLimit);

    const forceScreenRenderedAfterLimit = () => {
      if (forceScreenRenderedTimeout) {
        clearTimeout(forceScreenRenderedTimeout);
      }
      forceScreenRenderedTimeout = setTimeout(() => {
        console.log(
          `Still receiving logs after ${screenRenderedTimeout}ms. Resolving with received data until now`
        );
        stopAndResolve();
      }, screenRenderedTimeoutLimit);
    };

    const waitForNoLogs = () => {
      if (screenRenderedTimeout) {
        clearTimeout(screenRenderedTimeout);
      }
      screenRenderedTimeout = setTimeout(() => {
        stopAndResolve();
      }, screenIsRenderedAfterSilent);
    };

    const onNewLine = () => {
      waitForNoLogs();
    };

    const onNewScreen = () => {
      screens++;
      if (screens > screensLimit) {
        console.log(`More than ${screensLimit} new screens rendered. Resolving with last one`);
        stopAndResolve();
      } else {
        if (newScreenTimeout) {
          clearTimeout(newScreenTimeout);
        }
        forceScreenRenderedAfterLimit();
        this._eventEmitter.on(LOG_EVENT_NAME, onNewLine);
        waitForNoLogs();
      }
    };

    const stop = () => {
      stopAndResolve();
    };

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      this._eventEmitter.on(STOP_WAITS_EVENT_NAME, stop);
      this._eventEmitter.on(CLEAR_SCREEN_EVENT_NAME, onNewScreen);
    });
  }

  stopWaits() {
    this._eventEmitter.emit(STOP_WAITS_EVENT_NAME);
  }

  join(logs) {
    return logs.join(NEW_LINE_CHAR);
  }

  get screensLines() {
    return [...this._screens];
  }

  get screens() {
    return this._screens.map(this.join);
  }

  get currentScreenLines() {
    return [...this._currentScreenLogs];
  }

  get currentScreen() {
    return this.join(this._currentScreenLogs);
  }

  get allLines() {
    return [...this._allLogs];
  }

  get all() {
    return this.join(this._allLogs);
  }

  get lines() {
    return [...this._lines];
  }

  get current() {
    return this.join(this._lines);
  }

  flushCurrent() {
    this._lines = [];
  }
}

module.exports = Logs;
