/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("@hapi/boom");

const { compact, uniqBy } = require("lodash");

const tracer = require("../tracer");
const Behavior = require("./Behavior");

const { CHANGE_LEGACY_MOCKS } = require("../eventNames");

class Behaviors {
  constructor(loaders, settings, eventEmitter, { addAlert, removeAlerts }) {
    this._loaders = loaders;
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._noBehavior = new Behavior();
    this._addAlert = addAlert;
    this._removeAlerts = removeAlerts;
  }

  async init(fixturesHandler, allFixtures) {
    this._fixturesHandler = fixturesHandler;
    this._allFixtures = allFixtures;
    await this._noBehavior.init(this._fixturesHandler, allFixtures);
    return Promise.resolve();
  }

  async process() {
    tracer.debug("Processing behaviors");
    this._collection = await this._getBehaviorsCollection();
    this._behaviors = this._getBehaviorsObject();
    this._ids = Object.keys(this._behaviors);
    this._current = this._settings.get("behavior");

    tracer.verbose(`Processed ${this._collection.length} behaviors`);

    try {
      this._checkCurrent(this._current);
      this._removeAlerts();
    } catch (error) {
      let currentFailed;
      if (this._current !== null) {
        currentFailed = this._current;
      }
      this._current = this._ids[0];
      if (this._current) {
        tracer.warn(`Initializing with first found behavior: "${this._ids[0]}"`);
        this._settings.set("behavior", this._current);
        if (currentFailed) {
          this._addAlert(
            "current",
            `Defined behavior "${currentFailed}" was not found. The first one found was used instead`
          );
        }
      }
    }

    this._eventEmitter.emit(CHANGE_LEGACY_MOCKS);
    return Promise.resolve();
  }

  _isBehaviorDefinition(object) {
    return !!(
      !(object instanceof Behavior) &&
      object.fixtures &&
      Array.isArray(object.fixtures) &&
      object.id
    );
  }

  _factorial(number) {
    if (number <= 1) return 1;
    return number * this._factorial(number - 1);
  }

  _areAllCandidatesChecked() {
    return this._behaviorsCandidates.length > this._factorial(this._loaders.contents.length);
  }

  _initBehavior(index, initedBehaviors) {
    const object = this._behaviorsCandidates[index];
    let behaviorCandidate = object;
    // Behaviors defined in json file
    if (this._isBehaviorDefinition(object)) {
      if (object.from) {
        const parentBehavior = initedBehaviors.find(
          (behavior) => behavior && behavior.id === object.from
        );
        if (parentBehavior) {
          behaviorCandidate = parentBehavior.extend(object.fixtures);
          behaviorCandidate.id = object.id;
        } else {
          if (!this._areAllCandidatesChecked()) {
            this._behaviorsCandidates.push(object);
          }
          return Promise.resolve();
        }
      } else {
        behaviorCandidate = new Behavior(object.fixtures, { id: object.id });
      }
    }
    // Behaviors instantiated directly in JS files
    if (behaviorCandidate.isBehaviorInstance) {
      return behaviorCandidate
        .init(this._fixturesHandler, this._allFixtures)
        .then((initedBehavior) => {
          // TODO, remove the addition of extra properties when reading files. Define a mandatory id for the behavior.
          initedBehavior.id = initedBehavior.id || object._mocksServer_lastPath;
          this._allFixtures.add(initedBehavior.fixtures);
          return Promise.resolve(initedBehavior);
        })
        .catch((err) => {
          tracer.error("Error initializing behavior");
          tracer.debug(err.toString());
          return Promise.resolve();
        });
    }
    return Promise.resolve();
  }

  _initBehaviors(index = 0, initedBehaviors = []) {
    if (index >= this._behaviorsCandidates.length) {
      return Promise.resolve(initedBehaviors);
    }
    return this._initBehavior(index, initedBehaviors).then((initedBehavior) => {
      initedBehaviors.push(initedBehavior);
      return this._initBehaviors(index + 1, initedBehaviors);
    });
  }

  _getBehaviorsCollection() {
    this._behaviorsCandidates = [...this._loaders.contents];
    return this._initBehaviors().then((initedBehaviors) => {
      // TODO, remove the addition of extra properties when reading files. Define mandatory id for the behavior.
      this._loaders.contents.forEach((content) => {
        if (content._mocksServer_lastPath) {
          delete content._mocksServer_lastPath;
        }
      });
      return Promise.resolve(uniqBy(compact(initedBehaviors), (behavior) => behavior.id));
    });
  }

  _getBehaviorsObject() {
    const behaviorsById = {};
    this._collection.map((behavior) => {
      behaviorsById[behavior.id] = behavior;
    });
    return behaviorsById;
  }

  _checkCurrent(behaviorId) {
    if (!this._ids.includes(behaviorId)) {
      throw Boom.badData(`Behavior not found: ${behaviorId}`);
    }
  }

  set current(behaviorId) {
    this._checkCurrent(behaviorId);
    this._removeAlerts("current");
    this._current = behaviorId;
  }

  get current() {
    return this._behaviors[this._current] || this._noBehavior;
  }

  get all() {
    return this._behaviors;
  }

  // TODO, deprecate, use ids instead
  get names() {
    tracer.deprecationWarn("names", "ids");
    return this._ids || [];
  }

  get ids() {
    return this._ids || [];
  }

  get count() {
    return this.ids.length;
  }

  // TODO, deprecate, use currentId instead
  get currentName() {
    tracer.deprecationWarn("currentName", "currentId");
    return this._current;
  }

  get currentId() {
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
