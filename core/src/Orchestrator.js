/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { CHANGE_SETTINGS, LOAD_LEGACY_MOCKS, LOAD_MOCKS, LOAD_ROUTES } = require("./eventNames");

class Orchestrator {
  constructor(eventEmitter, legacyMocks, server, mocks) {
    this._eventEmitter = eventEmitter;

    this._mocks = mocks;
    this._legacyMocks = legacyMocks;
    this._server = server;

    this._onChangeSettings = this._onChangeSettings.bind(this);
    this._onLoadLegacyMocks = this._onLoadLegacyMocks.bind(this);
    this._onLoadMocks = this._onLoadMocks.bind(this);
    this._onLoadRoutes = this._onLoadRoutes.bind(this);

    this._eventEmitter.on(CHANGE_SETTINGS, this._onChangeSettings);
    this._eventEmitter.on(LOAD_LEGACY_MOCKS, this._onLoadLegacyMocks);

    this._loadedMocks = false;
    this._loadedRoutes = false;
    this._eventEmitter.on(LOAD_ROUTES, this._onLoadRoutes);
    this._eventEmitter.on(LOAD_MOCKS, this._onLoadMocks);
  }

  _onChangeSettings(changeDetails) {
    if (
      changeDetails.hasOwnProperty("port") ||
      changeDetails.hasOwnProperty("host") ||
      changeDetails.hasOwnProperty("cors") ||
      changeDetails.hasOwnProperty("corsPreFlight")
    ) {
      this._server.restart();
    }
    // TODO, remove legacy
    if (changeDetails.hasOwnProperty("behavior")) {
      this._legacyMocks.behaviors.current = changeDetails.behavior;
    }
    if (changeDetails.hasOwnProperty("mock")) {
      this._mocks.current = changeDetails.mock;
    }
  }

  _onLoadLegacyMocks() {
    this._legacyMocks.processLoadedMocks();
  }

  _onLoadMocks() {
    this._loadedMocks = true;
    if (this._loadedRoutes) {
      this._mocks.load();
    }
  }

  _onLoadRoutes() {
    this._loadedRoutes = true;
    if (this._loadedMocks) {
      this._mocks.load();
    }
  }
}

module.exports = Orchestrator;
