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
const InquirerCli = require("./cli/Cli");

class ProgrammaticCli {
  constructor(options = {}) {
    this._core = new Core({
      onlyProgrammaticOptions: true
    });
    this._adminApi = new AdminApi(this._core);
    this._inquirerCli = new InquirerCli(this._core);
    this._options = { ...options };
    this._initPromise = null;
  }

  _init() {
    if (!this._initPromise) {
      this._initPromise = this._core.init(this._options).then(() => {
        this._adminApi.init();
        this._inquirerCli.init();
        return Promise.resolve();
      });
    }
    return this._initPromise;
  }

  async start() {
    await this._init();
    await this._core.start();
    return this._inquirerCli.start();
  }

  async initServer() {
    await this._init();
    return this._core.start();
  }

  stopListeningServerWatch() {
    return this._inquirerCli.stopListeningServerWatch();
  }
}

module.exports = ProgrammaticCli;
