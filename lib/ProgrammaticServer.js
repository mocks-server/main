/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

// TODO, deprecate this programmatic initialization. Use Core instead.

const Core = require("./core/Core");
const AdminApi = require("./api/Api");

class ProgrammaticServer {
  constructor(mocksFolder, options = {}) {
    this._core = new Core({
      onlyProgrammaticOptions: true
    });
    this._adminApi = new AdminApi(this._core);
    this._options = { ...options, behaviors: mocksFolder };
    this._initPromise = null;
    this._core.tracer.warn(
      "Deprecation warning: Server constructor will be deprecated. Use @mocks-server/core instead"
    );
  }

  async _init() {
    if (!this._initPromise) {
      this._initPromise = this._core.init(this._options).then(() => {
        this._adminApi.init();
        return Promise.resolve();
      });
    }
    return this._initPromise;
  }

  async start() {
    await this._init();
    return this._core.start();
  }

  async stop() {
    await this._init();
    return this._core.stop();
  }

  async switchWatch(state) {
    await this._init();
    return this._core.settings.set("watch", state);
  }

  get behaviors() {
    return this._core.behaviors;
  }

  get watchEnabled() {
    return this._core.watchEnabled;
  }

  get error() {
    return this._core.serverError;
  }

  get events() {
    return this._core.eventEmitter;
  }
}

module.exports = ProgrammaticServer;
