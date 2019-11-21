/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("boom");

const { flatten, map, each, compact } = require("lodash");

const tracer = require("../tracer");

const { LOAD_MOCKS, CHANGE_SETTINGS } = require("../eventNames");

class Behaviors {
  constructor(filesHandler, settings, eventEmitter) {
    this._filesHandler = filesHandler;
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._onLoadMocks = this._onLoadMocks.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  init() {
    this._loadBehaviors();
    this._eventEmitter.on(LOAD_MOCKS, this._onLoadMocks);
    this._eventEmitter.on(CHANGE_SETTINGS, this._onChangeSettings);
    return Promise.resolve();
  }

  _loadBehaviors() {
    tracer.debug("Processing mocks");
    this._behaviors = this._getBehaviors(this._filesHandler.files);
    this._totalFixtures = this._getTotalFixtures(this._filesHandler.files);
    this._collection = this._getCollection(this._filesHandler.files);
    this._names = this._getNames(this._collection);
    this._current = this._settings.get("behavior") || this._names[0];
    tracer.silly(
      `Mocks details: ${JSON.stringify(
        {
          totalFixtures: this._totalFixtures,
          current: this._current
        },
        null,
        2
      )}`
    );

    try {
      this._checkCurrent(this._current);
    } catch (error) {
      tracer.warn(
        `Defined behavior "${this._current}" was not found. Inititializing with first found behavior`
      );
      this._current = this._names[0];
    }
  }

  _onLoadMocks() {
    this._loadBehaviors();
  }

  _onChangeSettings(changeDetails) {
    if (changeDetails.hasOwnProperty("behavior")) {
      this.current = changeDetails.behavior;
    }
  }

  _getCollection(mocksFolderFiles) {
    return compact(
      flatten(
        map(mocksFolderFiles, mocksFolderFile =>
          map(mocksFolderFile, (behavior, behaviorName) => {
            if (behavior.fixtures) {
              return {
                name: behaviorName,
                fixtures: behavior.fixtures
              };
            }
            return null;
          })
        )
      )
    );
  }

  _getBehaviors(mocksFolderFiles) {
    const behaviors = {};
    each(mocksFolderFiles, mocksFolderFile => {
      each(mocksFolderFile, (behavior, behaviorName) => {
        // TODO, check if current object is a behavior with common method
        if (behavior.methods) {
          behaviors[behaviorName] = behavior.methods;
        }
      });
    });
    return behaviors;
  }

  _getTotalFixtures(mocksFolderFiles) {
    const totalFixtures = {};
    each(mocksFolderFiles, mocksFolderFile => {
      each(mocksFolderFile, (behavior, behaviorName) => {
        // TODO, check if current object is a behavior with common method
        if (behavior.totalFixtures) {
          totalFixtures[behaviorName] = behavior.totalFixtures;
        }
      });
    });
    return totalFixtures;
  }

  _getNames(collection) {
    return collection.map(item => item.name);
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
    return this._behaviors[this._current];
  }

  get currentTotalFixtures() {
    return this._totalFixtures[this._current];
  }

  get currentFromCollection() {
    return this._collection.find(item => item.name === this._current);
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
}

module.exports = Behaviors;
