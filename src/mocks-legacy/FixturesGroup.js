/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { compact } = require("lodash");
const tracer = require("../tracer");

class FixturesGroup {
  constructor(fixtures = []) {
    this._fixtures = [...fixtures].reverse();
  }

  _convertStringReferences(allFixtures) {
    if (allFixtures) {
      this._fixtures = compact(
        this._fixtures.map((fixture) => {
          if (typeof fixture === "string") {
            const realFixture = allFixtures.collection.find((existantFixture) => {
              return existantFixture.id === fixture;
            });
            if (!realFixture) {
              tracer.debug(`Fixture with id "${fixture}" was not found and will be ignored`);
            }
            return realFixture;
          }
          return fixture;
        })
      );
    }
  }

  async init(fixturesHandler, allFixtures) {
    this._convertStringReferences(allFixtures);
    this._collection = await fixturesHandler.getCollection(this._fixtures);
    return Promise.resolve(this);
  }

  get collection() {
    return this._collection;
  }
}

module.exports = FixturesGroup;
