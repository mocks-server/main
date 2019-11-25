/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const Boom = require("boom");
const requireAll = require("require-all");
const watch = require("node-watch");

const { map, debounce } = require("lodash");

const tracer = require("../tracer");
const { LOAD_MOCKS, CHANGE_SETTINGS } = require("../eventNames");

class FilesHandler {
  constructor(settings, eventEmitter, extraOptions = {}) {
    this._customRequireCache = extraOptions.requireCache;
    this._settings = settings;
    this._eventEmitter = eventEmitter;
    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  init() {
    this._eventEmitter.on(CHANGE_SETTINGS, this._onChangeSettings);
    try {
      this._loadFiles();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  start() {
    this._switchWatch();
  }

  stop() {
    if (this._watcher) {
      tracer.debug("Stopping files watch");
      this._watcher.close();
    }
  }

  _cleanRequireCacheFolder() {
    map(this._cache(), (cacheData, filePath) => {
      if (filePath.indexOf(this._path) === 0) {
        this._cleanRequireCache(this._cache()[filePath]);
      }
    });
  }

  _cleanRequireCache(requireModule) {
    if (requireModule) {
      map(requireModule.children, moduleData => {
        if (moduleData.id.indexOf(this._path) === 0) {
          this._cleanRequireCache(this._cache()[moduleData.id]);
        }
      });
      this._cache()[requireModule.id] = undefined;
    }
  }

  _resolveFolder(folder) {
    if (!folder) {
      tracer.error(
        'Please provide a path to a folder containing behaviors using the "behaviors" option'
      );
      throw Boom.badData("Invalid mocks folder");
    }
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  _loadFiles() {
    this._path = this._resolveFolder(this._settings.get("behaviors"));
    tracer.info(`Loading mocks from folder ${this._path}`);
    this._cleanRequireCacheFolder();
    this._files = requireAll({
      dirname: this._path,
      recursive: true
    });
    this._eventEmitter.emit(LOAD_MOCKS);
  }

  _switchWatch() {
    const enabled = this._settings.get("watch");
    this.stop();
    if (enabled) {
      tracer.debug("Starting files watcher");
      this._watcher = watch(
        this._path,
        { recursive: true },
        debounce(() => {
          tracer.info("Files changed detected");
          this._loadFiles();
        }),
        1000
      );
    }
  }

  _onChangeSettings(changeDetails) {
    if (changeDetails.hasOwnProperty("behaviors")) {
      this._loadFiles();
      this._switchWatch();
    } else if (changeDetails.hasOwnProperty("watch")) {
      this._switchWatch();
    }
  }

  _cache() {
    return this._customRequireCache || require.cache;
  }

  get files() {
    return this._files;
  }
}

module.exports = FilesHandler;
