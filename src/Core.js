/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const EventEmitter = require("events");

const { LOAD_MOCKS, CHANGE_SETTINGS } = require("./eventNames");
const Server = require("./server/Server");
const tracer = require("./tracer");
const Mocks = require("./mocks/Mocks");
const Settings = require("./settings/Settings");
const Plugins = require("./Plugins");

const { INIT, START } = require("./eventNames");

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
    this._plugins = new Plugins(coreOptions.plugins, this);
    this._inited = false;
    this._startPluginsPromise = null;
  }

  async init(options) {
    if (this._inited) {
      return Promise.resolve();
    }
    this._inited = true;
    // Register plugins, let them add their custom settings
    await this._plugins.register();
    // Init settings, read command line arguments, etc.
    await this._settings.init(options);
    // Settings are ready, init all
    await this._mocks.init();
    await this._server.init();
    return this._plugins.init().then(() => {
      this._eventEmitter.emit(INIT, this);
    });
  }

  async start() {
    await this.init(); // in case it has not been initializated manually before
    await this._mocks.start();
    await this._server.start();
    return this._startPlugins().then(() => {
      this._eventEmitter.emit(START, this);
    });
  }

  async _startPlugins() {
    if (!this._startPluginsPromise) {
      this._startPluginsPromise = this._plugins.start();
    }
    return this._startPluginsPromise;
  }

  addCustomRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  addCustomSetting(option) {
    return this._settings.addCustom(option);
  }

  // Listeners

  onLoadMocks(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(LOAD_MOCKS, cb);
    };
    this._eventEmitter.on(LOAD_MOCKS, cb);
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

  stop() {
    this._mocks.stop();
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

  // TODO, deprecate getter
  get features() {
    return this._mocks.behaviors;
  }

  get tracer() {
    return tracer;
  }
}

module.exports = Core;
