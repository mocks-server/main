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
  constructor() {
    this._options = {};
    this._server = {};
    this._optionsHandler = new Options();
    this._eventEmitter = new EventEmitter();
  }

  async init() {
    this._options = await this._optionsHandler.init();
    this._server = new Server(this._eventEmitter, this._options);
    return this._options;
  }

  addCustomRouter(router) {
    return this._server.addCustomRouter(router);
  }

  addCustomOption(option) {
    return this._optionsHandler.addCustomOption(option);
  }

  start() {
    return this._server.start();
  }

  get options() {
    return this._options;
  }

  get behaviors() {
    return this._server.behaviors;
  }

  get tracer() {
    return tracer;
  }

  get server() {
    // temporarily exposed while refactoring CLI
    return this._server;
  }
}

module.exports = Core;
