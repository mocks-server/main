/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const EventEmitter = require("events");

const { FILES_LOAD, CHANGE_SETTINGS } = require("./eventNames");
const Server = require("./server/Server");
const tracer = require("./tracer");
const Mocks = require("./mocks/Mocks");
const Settings = require("./settings/Settings");

class Core {
  constructor(coreOptions = {}) {
    this._eventEmitter = new EventEmitter();
    this._settings = new Settings(
      {
        onlyProgrammaticOptions: coreOptions.onlyProgrammaticOptions
      },
      this._eventEmitter
    );
    this._mocks = new Mocks(this._settings, this._eventEmitter);
    this._server = new Server(this._mocks, this._settings, this._eventEmitter);
  }

  async init(options) {
    await this._settings.init(options);
    await this._mocks.init();
    return this._server.init();
  }

  addCustomRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  addCustomSetting(option) {
    return this._settings.addCustom(option);
  }

  // Listeners

  onLoadFiles(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(FILES_LOAD, cb);
    };
    this._eventEmitter.on(FILES_LOAD, cb);
    return removeCallback;
  }

  onChangeSettings(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(CHANGE_SETTINGS, cb);
    };
    this._eventEmitter.on(CHANGE_SETTINGS, cb);
    return removeCallback;
  }

  // Expose Server methods and getters

  start() {
    return this._server.start();
  }

  stop() {
    return this._server.stop();
  }

  restart() {
    return this._server.restart();
  }

  get serverError() {
    return this._server.error;
  }

  // Expose child objects needed

  get settings() {
    return this._settings;
  }

  get behaviors() {
    return this._mocks.behaviors;
  }

  get tracer() {
    return tracer;
  }
}

module.exports = Core;
