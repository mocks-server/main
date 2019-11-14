/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("boom");
const requireAll = require("require-all");

const { flatten, map, each, compact } = require("lodash");

const tracer = require("./tracer");

class Behaviors {
  constructor(mocksFolder, current, options = {}) {
    this._customCache = options.cache;
    this._recursive = options.recursive; // TODO, deprecate option. It is not being used. Not breaking change
    this._mocksFolder = mocksFolder;
    const mocksFolderFiles = this.requiremocksFolderFiles();
    this._behaviors = this.getBehaviors(mocksFolderFiles);
    this._totalFixtures = this.getTotalFixtures(mocksFolderFiles);
    this._collection = this.getCollection(mocksFolderFiles);
    this._names = this.getNames(this._collection);
    this._current = current || this._names[0];

    try {
      this.checkCurrent(this._current);
    } catch (error) {
      tracer.warn(
        `Defined behavior "${this._current}" was not found. Inititializing with first found behavior`
      );
      this._current = this._names[0];
    }
  }

  getCollection(mocksFolderFiles) {
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

  getBehaviors(mocksFolderFiles) {
    const behaviors = {};
    each(mocksFolderFiles, mocksFolderFile => {
      each(mocksFolderFile, (behavior, behaviorName) => {
        // check if current object is a behavior
        if (behavior.methods) {
          behaviors[behaviorName] = behavior.methods;
        }
      });
    });
    return behaviors;
  }

  getTotalFixtures(mocksFolderFiles) {
    const totalFixtures = {};
    each(mocksFolderFiles, mocksFolderFile => {
      each(mocksFolderFile, (behavior, behaviorName) => {
        // check if current object is a behavior
        if (behavior.totalFixtures) {
          totalFixtures[behaviorName] = behavior.totalFixtures;
        }
      });
    });
    return totalFixtures;
  }

  getNames(collection) {
    return collection.map(item => item.name);
  }

  checkCurrent(behaviorName) {
    if (!this._names.includes(behaviorName)) {
      throw Boom.badData(`Behavior not found: ${behaviorName}`);
    }
  }

  cache() {
    return this._customCache || require.cache;
  }

  cleanRequireCache(module) {
    if (module) {
      map(module.children, moduleData => {
        if (moduleData.id.indexOf(this._mocksFolder) === 0) {
          this.cleanRequireCache(this.cache()[moduleData.id]);
        }
      });
      this.cache()[module.id] = undefined;
    }
  }

  cleanRequireCacheFolder() {
    map(this.cache(), (cacheData, filePath) => {
      if (filePath.indexOf(this._mocksFolder) === 0) {
        this.cleanRequireCache(this.cache()[filePath]);
      }
    });
  }

  requiremocksFolderFiles() {
    tracer.debug(`Loading behaviors from folder ${this._mocksFolder}`);
    this.cleanRequireCacheFolder();
    return requireAll({
      dirname: this._mocksFolder,
      recursive: true
    });
  }

  set current(behaviorName) {
    this.checkCurrent(behaviorName);
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

  get totalBehaviors() {
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
