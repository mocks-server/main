/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const EventEmitter = require("events");

const { INIT, START, STOP, LOAD_FILES, CHANGE_MOCKS, CHANGE_SETTINGS } = require("./eventNames");
const tracer = require("./tracer");

const Orchestrator = require("./Orchestrator");

const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const Mocks = require("./mocks/Mocks");
const Settings = require("./settings/Settings");

class Core {
  constructor(coreOptions = {}) {
    this._eventEmitter = new EventEmitter();
    this._settings = new Settings(this._eventEmitter, {
      onlyProgrammaticOptions: coreOptions.onlyProgrammaticOptions
    });

    this._plugins = new Plugins(coreOptions.plugins, this);

    this._mocks = new Mocks(this._eventEmitter, this._settings, this._plugins.loaders, this);
    this._server = new Server(this._eventEmitter, this._settings, this._mocks, this);

    this._orchestrator = new Orchestrator(this._eventEmitter, this._mocks, this._server);

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

  async _stopPlugins() {
    if (!this._stopPluginsPromise) {
      this._stopPluginsPromise = this._plugins.stop();
    }
    return this._stopPluginsPromise;
  }

  // TODO, deprecate method, use addRouter
  addCustomRouter(path, router) {
    tracer.deprecationWarn("addCustomRouter", "addRouter");
    return this.addRouter(path, router);
  }

  addRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  removeRouter(path, router) {
    return this._server.removeCustomRouter(path, router);
  }

  // TODO, deprecate method, use addSetting
  addCustomSetting(option) {
    tracer.deprecationWarn("addCustomSetting", "addSetting");
    return this.addSetting(option);
  }

  addSetting(option) {
    return this._settings.addCustom(option);
  }

  addFixturesHandler(Handler) {
    return this._mocks.addFixturesHandler(Handler);
  }

  // Listeners

  // TODO, deprecate method
  onLoadFiles(cb) {
    tracer.deprecationWarn("onLoadFiles", "onChangeMocks");
    const removeCallback = () => {
      this._eventEmitter.removeListener(LOAD_FILES, cb);
    };
    this._eventEmitter.on(LOAD_FILES, cb);
    return removeCallback;
  }

  // TODO, deprecate method, use onChangeMocks
  onLoadMocks(cb) {
    tracer.deprecationWarn("onLoadMocks", "onChangeMocks");
    return this.onChangeMocks(cb);
  }

  onChangeMocks(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(CHANGE_MOCKS, cb);
    };
    this._eventEmitter.on(CHANGE_MOCKS, cb);
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

  async stop() {
    await this._server.stop();
    return this._stopPlugins().then(() => {
      this._eventEmitter.emit(STOP, this);
    });
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

  get fixtures() {
    return this._mocks.fixtures;
  }

  // TODO, deprecate getter
  get features() {
    tracer.deprecationWarn("features getter", "behaviors getter");
    return this._mocks.behaviors;
  }

  get tracer() {
    return tracer;
  }
}

module.exports = Core;
