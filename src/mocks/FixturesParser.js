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

class FixturesParser {
  constructor() {
    this._parsers = [];
  }

  addParser(Parser) {
    this._parsers.push(Parser);
  }

  _getParser(fixture) {
    return this._parsers.find(parser => parser.recognize(fixture));
  }

  getCollection(fixtures) {
    const addedFixtures = [];
    return compact(
      fixtures.map(fixture => {
        const Parser = this._getParser(fixture);
        if (Parser) {
          tracer.debug(`Creating fixture with parser ${Parser.displayName}`);
          const newFixture = new Parser(fixture);
          if (addedFixtures.find(existingFixture => existingFixture.id === newFixture.id)) {
            return null;
          }
          addedFixtures.push(newFixture);
          return newFixture;
        } else {
          tracer.silly("Fixture not identified by any registered fixtures parser");
          return null;
        }
      })
    );
  }
}

module.exports = FixturesParser;
