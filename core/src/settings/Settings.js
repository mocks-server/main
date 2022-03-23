/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Options = require("./Options");

const tracer = require("../tracer");
const { CHANGE_SETTINGS } = require("../eventNames");

class Settings {
  constructor(eventEmitter, config) {
    this._eventEmitter = eventEmitter;
    this._optionsHandler = new Options(config);
    // TODO, remove next unnecessary bind
    this._emitChange = this._emitChange.bind(this); //Add debounce here to group change events
    this._newSettings = {};
  }

  async init(options) {
    await this._optionsHandler.init(options);
    this._settings = { ...this._optionsHandler.options };
    this._setTracerLevel();
    tracer.info("Settings ready");
    tracer.verbose(`Current settings: ${JSON.stringify(this._settings, null, 2)}`);
    return Promise.resolve();
  }

  _setTracerLevel() {
    tracer.set(this._settings.log);
  }

  _emitChange() {
    this._eventEmitter.emit(CHANGE_SETTINGS, { ...this._newSettings });
    this._newSettings = {};
  }

  set(option, value) {
    const optionName = this._optionsHandler.checkValidOptionName(option);
    if (this._settings[optionName] !== value) {
      tracer.debug(`Changing setting "${optionName}" to new value ${value}`);
      this._settings[optionName] = value;
      this._newSettings[optionName] = value;
      this._emitChange();
      if (optionName === "log") {
        this._setTracerLevel();
      }
    }
  }

  get(option) {
    return this._settings[this._optionsHandler.checkValidOptionName(option)];
  }

  getValidOptionName(optionName) {
    return this._optionsHandler.getValidOptionName(optionName);
  }

  get all() {
    return { ...this._settings };
  }

  addCustom(option) {
    return this._optionsHandler.addCustom(option);
  }
}

module.exports = Settings;
