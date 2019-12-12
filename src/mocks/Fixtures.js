/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const tracer = require("../tracer");
const FixturesGroup = require("./FixturesGroup");

const { LOAD_FILES, LOAD_FIXTURES } = require("../eventNames");

class Fixtures {
  constructor(filesHandler, settings, eventEmitter) {
    this._filesHandler = filesHandler;
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._onLoadFiles = this._onLoadFiles.bind(this);
  }

  async init(fixturesParser) {
    this._fixturesParser = fixturesParser;
    this._eventEmitter.on(LOAD_FILES, this._onLoadFiles);
    return this._loadFixtures();
  }

  add(fixtures) {
    fixtures.forEach(fixture => {
      const existingFixture = this.collection.find(
        allFixturesElement => fixture.id === allFixturesElement.id
      );
      if (!existingFixture) {
        tracer.verbose("Added fixture that was not registered in fixtures collection");
        this._fixtures.collection.push(fixture);
      }
    });
  }

  async _loadFixtures() {
    tracer.debug("Processing fixtures");
    this._fixtures = await this._getFixtures();

    this._eventEmitter.emit(LOAD_FIXTURES);
    return Promise.resolve();
  }

  _onLoadFiles() {
    this._loadFixtures();
  }

  _getFixtures() {
    const fixtures = new FixturesGroup(this._filesHandler.contents);
    return fixtures.init(this._fixturesParser);
  }

  get count() {
    return this._fixtures.collection.length;
  }

  get collection() {
    return this._fixtures.collection;
  }
}

module.exports = Fixtures;
