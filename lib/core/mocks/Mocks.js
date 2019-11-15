/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Behaviors = require("./Behaviors");
const FilesHandler = require("./FilesHandler");

class Mocks {
  constructor(settings, eventEmitter) {
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._filesHandler = new FilesHandler(this._settings, this._eventEmitter);
    this._behaviors = new Behaviors(this._filesHandler, this._settings, this._eventEmitter);
  }

  async init() {
    await this._filesHandler.init();
    return this._behaviors.init();
  }

  get behaviors() {
    return this.behaviors;
  }
}

module.exports = Mocks;
