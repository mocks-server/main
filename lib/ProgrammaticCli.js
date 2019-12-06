/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

// TODO, deprecate this programmatic initialization. Use Core instead.

const { Core } = require("@mocks-server/core");
const AdminApi = require("@mocks-server/plugin-admin-api");
const InquirerCli = require("./cli/Cli");

class ProgrammaticCli {
  constructor(options = {}) {
    const createInquirerCli = core => {
      this._inquirerCli = new InquirerCli(core);
      return this._inquirerCli;
    };

    this._core = new Core({
      onlyProgrammaticOptions: true,
      plugins: [AdminApi, createInquirerCli]
    });
    this._options = { ...options };
    this._cliStarted = false;
    this._coreStarted = false;
    this._core.tracer.warn(
      "Deprecation warning: Cli constructor will be deprecated. Use @mocks-server/core instead"
    );
  }

  async _startCore(cliEnabled) {
    if (!this._coreStarted) {
      this._coreStarted = true;
      await this._core.init(this._options);
      this._core.settings.set("cli", cliEnabled);
      return this._core.start();
    }
    return Promise.resolve();
  }

  async start() {
    await this._startCore(true);
    if (!this._cliStarted && !this._core.settings.get("cli")) {
      this._core.settings.set("cli", true);
      this._cliStarted = true;
      return this._inquirerCli.start();
    }
    return Promise.resolve();
  }

  async initServer() {
    return this._startCore(false);
  }

  stopListeningServerWatch() {
    return this._inquirerCli.stopListeningServerWatch();
  }
}

module.exports = ProgrammaticCli;
