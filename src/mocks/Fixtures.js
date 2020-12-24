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

class Fixtures {
  constructor(loaders) {
    this._loaders = loaders;
  }

  async init(fixturesHandler) {
    this._fixturesHandler = fixturesHandler;
    return Promise.resolve();
  }

  add(fixtures) {
    fixtures.forEach((fixture) => {
      const existingFixture = this.collection.find(
        (allFixturesElement) => fixture.id === allFixturesElement.id
      );
      if (!existingFixture) {
        tracer.verbose("Added fixture that was not registered in fixtures collection");
        this._fixtures.collection.push(fixture);
      }
    });
  }

  async process() {
    tracer.debug("Processing fixtures");
    this._fixtures = await this._getFixtures();
    tracer.verbose(`Processed ${this._fixtures.collection.length} fixtures`);
    return Promise.resolve();
  }

  _getFixtures() {
    const fixtures = new FixturesGroup(this._loaders.contents);
    return fixtures.init(this._fixturesHandler);
  }

  get count() {
    return (this._fixtures && this._fixtures.collection && this._fixtures.collection.length) || 0;
  }

  get collection() {
    return (this._fixtures && this._fixtures.collection) || [];
  }
}

module.exports = Fixtures;
