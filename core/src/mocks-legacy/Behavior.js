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

class Behavior {
  constructor(fixtures = [], options = {}, parent = null) {
    this._id = options.id;
    this._initialFixtures = [...fixtures];
    this._fixtures = new FixturesGroup(this._initialFixtures);
    this._parent = parent;
  }

  extend(fixtures, options) {
    return new Behavior(this._initialFixtures.concat(fixtures), options, this);
  }

  async init(fixturesHandler, allFixtures) {
    await this._fixtures.init(fixturesHandler, allFixtures);
    return Promise.resolve(this);
  }

  getRequestMatchingFixture(req) {
    return this._fixtures.collection.find((fixture) => fixture.requestMatch(req));
  }

  get isBehaviorInstance() {
    return true;
  }

  get fixtures() {
    return this._fixtures.collection;
  }

  get extendedFrom() {
    return this._parent ? this._parent.id : null;
  }

  // TODO, deprecate. Use id instead
  get name() {
    tracer.deprecationWarn("name", "id");
    return this._id;
  }

  // TODO, deprecate. Use id instead
  set name(id) {
    tracer.deprecationWarn("name", "id");
    this._id = id;
  }

  get id() {
    return this._id;
  }

  set id(id) {
    this._id = id;
  }
}

module.exports = Behavior;
