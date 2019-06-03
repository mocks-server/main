"use strict";

class Settings {
  constructor(initialSettings) {
    this._delay = initialSettings.delay;
  }

  set delay(value) {
    this._delay = value;
  }

  get delay() {
    return this._delay;
  }
}

module.exports = Settings;
