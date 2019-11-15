/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const EventEmitter = require("events");

const Options = require("./Options");
const Server = require("./Server");
const tracer = require("./tracer");

class Core {
  constructor(coreOptions = {}) {
    this._coreOptions = coreOptions;
    this._options = {};
    this._server = {};
    this._optionsHandler = new Options();
    this._eventEmitter = new EventEmitter();
    this._serverInitPromise = null;
  }

  async init(options) {
    if (!this._coreOptions.onlyProgrammaticOptions) {
      const optionsHandlerValues = await this._optionsHandler.init();
      this._options = {
        ...options,
        ...optionsHandlerValues
      };
    } else {
      this._options = this._optionsHandler.removeDeprecatedOptions({
        ...this._optionsHandler.defaults,
        ...options
      });
    }

    this._server = new Server(this._eventEmitter, this._options);
    return this._options;
  }

  addCustomRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  addCustomOption(option) {
    return this._optionsHandler.addCustomOption(option);
  }

  // TODO, remove. Add specific methods for each event to be exposed
  get eventEmitter() {
    return this._eventEmitter;
  }

  get tracer() {
    return tracer;
  }

  // TODO, remove. temporarily exposed while refactoring CLI
  get server() {
    return this._server;
  }

  // Expose Server methods and getters

  start() {
    if (!this._serverInitted) {
      this._serverInitPromise = this._server.init();
    }
    return this._serverInitPromise.then(() => {
      return this._server.start();
    });
  }

  stop() {
    return this._server.stop();
  }

  restart() {
    return this._server.restart();
  }

  get watchEnabled() {
    return this._server.watchEnabled;
  }

  get serverError() {
    return this._server.error;
  }

  // TODO, settings has to be instantiated by core, not by Server. Emit event when settings change
  get settings() {
    return this._server.settings;
  }

  // Expose Settings methods and getters

  get options() {
    return this._options;
  }

  get behaviors() {
    return this._server.behaviors;
  }

  // TODO, deprecate, use settings set method
  switchWatch(state) {
    return this._server.switchWatch(state);
  }
}

module.exports = Core;
