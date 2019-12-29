/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { CHANGE_SETTINGS } = require("./eventNames");

class Orchestrator {
  constructor(eventEmitter, mocks, server) {
    this._eventEmitter = eventEmitter;

    this._mocks = mocks;
    this._server = server;

    this._onChangeSettings = this._onChangeSettings.bind(this);

    this._eventEmitter.on(CHANGE_SETTINGS, this._onChangeSettings);
  }

  _onChangeSettings(/* newSettings */) {
    /* this._loaders.changeSettings(newSettings);
    this._mocks.changeSettings(newSettings);
    this._server.changeSettings(newSettings);
    */
  }
}

module.exports = Orchestrator;
