/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Behaviors = require("./Behaviors");
const FixturesHandler = require("./FixturesHandler");
const FixtureHandler = require("./FixtureHandler");
const Fixtures = require("./Fixtures");

const { scopedAlertsMethods } = require("../support/helpers");

class Mocks {
  constructor(eventEmitter, settings, loaders, core, { addAlert, removeAlerts }) {
    this._eventEmitter = eventEmitter;
    this._settings = settings;
    this._loaders = loaders;

    this._fixturesHandler = new FixturesHandler(core);
    this._fixturesHandler.addHandler(FixtureHandler);
    this._fixtures = new Fixtures(this._loaders);
    this._behaviors = new Behaviors(this._loaders, this._settings, this._eventEmitter, {
      ...scopedAlertsMethods("behaviors", addAlert, removeAlerts),
    });
  }

  async init() {
    await this._fixtures.init(this._fixturesHandler);
    await this._behaviors.init(this._fixturesHandler, this._fixtures);
    return Promise.resolve();
  }

  addFixturesHandler(Handler) {
    this._fixturesHandler.addHandler(Handler);
  }

  async processLoadedMocks() {
    await this._fixtures.process();
    return this._behaviors.process();
  }

  get behaviors() {
    return this._behaviors;
  }

  get fixtures() {
    return this._fixtures;
  }
}

module.exports = Mocks;
