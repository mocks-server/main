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

class FixturesHandler {
  constructor(core) {
    this._core = core; // Use this reference only to provide it to external functions for customization purposes
    this._handlers = [];
  }

  addHandler(Handler) {
    this._handlers.push(Handler);
  }

  _getHandler(fixture) {
    return this._handlers.find((handler) => handler.recognize(fixture));
  }

  getCollection(fixtures) {
    const addedFixtures = [];
    return compact(
      fixtures.map((fixture) => {
        if (fixture && fixture.isFixtureHandler) {
          return fixture;
        }
        const Handler = this._getHandler(fixture);
        if (Handler) {
          tracer.debug(`Creating fixture with handler ${Handler.displayName}`);
          const newFixture = new Handler(fixture, this._core);
          if (addedFixtures.find((existingFixture) => existingFixture.id === newFixture.id)) {
            return null;
          }
          newFixture.isFixtureHandler = true;
          addedFixtures.push(newFixture);
          return newFixture;
        } else {
          tracer.silly("Fixture not identified by any registered fixtures handler");
          return null;
        }
      })
    );
  }
}

module.exports = FixturesHandler;
