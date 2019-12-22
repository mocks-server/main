/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("@hapi/boom");

const { compact } = require("lodash");

const tracer = require("../tracer");
const Behavior = require("./Behavior");

const { CHANGE_MOCKS, CHANGE_FIXTURES, CHANGE_SETTINGS } = require("../eventNames");

class Behaviors {
  constructor(filesHandler, settings, eventEmitter) {
    this._filesHandler = filesHandler;
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._onLoadFixtures = this._onLoadFixtures.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
    this._noBehavior = new Behavior();
  }

  async init(fixturesHandler, allFixtures) {
    this._fixturesHandler = fixturesHandler;
    this._allFixtures = allFixtures;
    this._eventEmitter.on(CHANGE_FIXTURES, this._onLoadFixtures);
    this._eventEmitter.on(CHANGE_SETTINGS, this._onChangeSettings);
    await this._noBehavior.init(this._fixturesHandler);
    return this._loadBehaviors();
  }

  async _loadBehaviors() {
    tracer.debug("Processing behaviors");
    this._collection = await this._getBehaviorsCollection();
    this._filesHandler.cleanContentsCustomProperties();
    this._behaviors = this._getBehaviorsObject();
    this._names = Object.keys(this._behaviors);
    this._current = this._settings.get("behavior");

    tracer.verbose(`Loaded ${this._collection.length} behaviors`);

    try {
      this._checkCurrent(this._current);
    } catch (error) {
      tracer.warn(`Defined behavior "${this._current}" was not found.`);
      this._current = this._names[0];
      if (this._current) {
        tracer.warn(`Inititializing with first found behavior: "${this._names[0]}"`);
        this._settings.set("behavior", this._current);
      }
    }

    this._eventEmitter.emit(CHANGE_MOCKS);
    return Promise.resolve();
  }

  _onLoadFixtures() {
    this._loadBehaviors();
  }

  _onChangeSettings(changeDetails) {
    if (changeDetails.hasOwnProperty("behavior")) {
      this.current = changeDetails.behavior;
    }
  }

  _getBehaviorsCollection() {
    const mocksFolderContents = this._filesHandler.contents;
    const initBehaviors = [];
    const behaviors = {};
    mocksFolderContents.forEach(object => {
      // TODO, register more behavior parsers
      if (object.isMocksServerBehavior) {
        initBehaviors.push(
          object
            .init(this._fixturesHandler)
            .then(initedBehavior => {
              initedBehavior.name = initedBehavior.name || object._mocksServer_lastPath;
              behaviors[initedBehavior.name] = initedBehavior.name;
              this._allFixtures.add(initedBehavior.fixtures);
              return Promise.resolve(initedBehavior);
            })
            .catch(err => {
              tracer.error("Error initializing behavior");
              tracer.debug(err.toString());
              return Promise.resolve();
            })
        );
      }
    });
    return Promise.all(initBehaviors).then(initedBehaviors => {
      return Promise.resolve(compact(initedBehaviors));
    });
  }

  _getBehaviorsObject() {
    const behaviorsByName = {};
    this._collection.map(behavior => {
      behaviorsByName[behavior.name] = behavior;
    });
    return behaviorsByName;
  }

  _checkCurrent(behaviorName) {
    if (!this._names.includes(behaviorName)) {
      throw Boom.badData(`Behavior not found: ${behaviorName}`);
    }
  }

  set current(behaviorName) {
    this._checkCurrent(behaviorName);
    this._current = behaviorName;
  }

  get current() {
    return this._behaviors[this._current] || this._noBehavior;
  }

  get all() {
    return this._behaviors;
  }

  get names() {
    return this._names;
  }

  get count() {
    return this._names.length;
  }

  get currentName() {
    return this._current;
  }

  get collection() {
    return this._collection;
  }

  // TODO, deprecate
  get currentFromCollection() {
    return this.current;
  }

  // TODO, deprecate
  get currentTotalFixtures() {
    return this.current.fixtures.length;
  }
}

module.exports = Behaviors;
