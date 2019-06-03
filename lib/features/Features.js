"use strict";

const Boom = require("boom");
const requireAll = require("require-all");

const { flatten, map, each, compact } = require("lodash");

const tracer = require("../common/tracer");

class Features {
  constructor(featuresFolder, current, options = {}) {
    this._customCache = options.cache;
    this._recursive = options.recursive;
    this._featuresFolder = featuresFolder;
    const featuresFiles = this.requireFileFeatures();
    this._features = this.getFeatures(featuresFiles);
    this._totalFixtures = this.getTotalFixtures(featuresFiles);
    this._collection = this.getCollection(featuresFiles);
    this._names = this.getNames(this._collection);
    this._current = current || this._names[0];

    try {
      this.checkCurrent(this._current);
    } catch (error) {
      tracer.warn(
        `Defined feature "${this._current}" was not found. Inititializing with first found feature`
      );
      this._current = this._names[0];
    }
  }

  getCollection(featuresFiles) {
    return compact(
      flatten(
        map(featuresFiles, fileFeatures =>
          map(fileFeatures, (feature, featureName) => {
            if (feature.fixtures) {
              return {
                name: featureName,
                fixtures: feature.fixtures
              };
            }
            return null;
          })
        )
      )
    );
  }

  getFeatures(featuresFiles) {
    const features = {};
    each(featuresFiles, fileFeatures => {
      each(fileFeatures, (feature, featureName) => {
        if (feature.methods) {
          features[featureName] = feature.methods;
        }
      });
    });
    return features;
  }

  getTotalFixtures(featuresFiles) {
    const totalFixtures = {};
    each(featuresFiles, fileFeatures => {
      each(fileFeatures, (feature, featureName) => {
        if (feature.totalFixtures) {
          totalFixtures[featureName] = feature.totalFixtures;
        }
      });
    });
    return totalFixtures;
  }

  getNames(collection) {
    return collection.map(item => item.name);
  }

  checkCurrent(featureName) {
    if (!this._names.includes(featureName)) {
      throw Boom.badData(`Feature not found: ${featureName}`);
    }
  }

  cache() {
    return this._customCache || require.cache;
  }

  cleanRequireCache(module) {
    if (module) {
      map(module.children, moduleData => {
        if (moduleData.id.indexOf(this._featuresFolder) === 0) {
          this.cleanRequireCache(this.cache()[moduleData.id]);
        }
      });
      this.cache()[module.id] = undefined;
    }
  }

  cleanRequireCacheFolder() {
    map(this.cache(), (cacheData, filePath) => {
      if (filePath.indexOf(this._featuresFolder) === 0) {
        this.cleanRequireCache(this.cache()[filePath]);
      }
    });
  }

  requireFileFeatures() {
    tracer.debug(`Loading features from folder ${this._featuresFolder}`);
    this.cleanRequireCacheFolder();
    return requireAll({
      dirname: this._featuresFolder,
      recursive: true
    });
  }

  set current(featureName) {
    this.checkCurrent(featureName);
    this._current = featureName;
  }

  get current() {
    return this._features[this._current];
  }

  get currentTotalFixtures() {
    return this._totalFixtures[this._current];
  }

  get currentFromCollection() {
    return this._collection.find(item => item.name === this._current);
  }

  get all() {
    return this._features;
  }

  get names() {
    return this._names;
  }

  get totalFeatures() {
    return this._names.length;
  }

  get currentName() {
    return this._current;
  }

  get collection() {
    return this._collection;
  }
}

module.exports = Features;
