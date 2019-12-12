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
const fsExtra = require("fs-extra");

const { map, debounce, flatten, isObject } = require("lodash");

const tracer = require("../tracer");
const { LOAD_FILES, CHANGE_SETTINGS } = require("../eventNames");

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
      tracer.error('Please provide a path to the folder containing mocks using the "path" option');
      throw Boom.badData("Invalid mocks folder");
    }
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  _ensureFolder(folder) {
    fsExtra.ensureDirSync(folder);
    return folder;
  }

  _loadFiles() {
    this._path = this._ensureFolder(this._resolveFolder(this._settings.get("path")));
    tracer.info(`Loading files from folder ${this._path}`);
    this._cleanRequireCacheFolder();
    this._files = requireAll({
      dirname: this._path,
      recursive: true,
      resolve: fileContent => {
        try {
          fileContent._mocksServer_isFile = true;
        } catch (error) {}
        return fileContent;
      }
    });
    tracer.silly(`Loaded files from folder ${this._path}`);
    this._contents = this._getContents(this._files);
    this._eventEmitter.emit(LOAD_FILES);
  }

  _addPathToLoadedObject(object, fullPath, lastPath) {
    try {
      object._mocksServer_fullPath = fullPath;
      object._mocksServer_lastPath = lastPath;
    } catch (error) {}
    return object;
  }

  _getContents(files, fileName = "") {
    const contents = [];
    if (files._mocksServer_isFile || !isObject(files)) {
      if (isObject(files)) {
        // module exports is an object, add path to each one.
        Object.keys(files).map(key => {
          if (isObject(files[key])) {
            this._addPathToLoadedObject(files[key], `${fileName}/${key}`, key);
            contents.push(files[key]);
          }
        });
        // Add also the full object, maybe it is a single export
        this._addPathToLoadedObject(files, fileName, fileName.split("/").pop());
        contents.push(files);
      }
    } else {
      Object.keys(files).map(childFileName => {
        contents.push(this._getContents(files[childFileName], `${fileName}/${childFileName}`));
      });
    }
    return flatten(contents);
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
    if (changeDetails.hasOwnProperty("path")) {
      this._loadFiles();
      this._switchWatch();
    } else if (changeDetails.hasOwnProperty("watch")) {
      this._switchWatch();
    }
  }

  _cache() {
    return this._customRequireCache || require.cache;
  }

  cleanContentsCustomProperties() {
    this._contents.forEach(content => {
      delete content._mocksServer_lastPath;
      delete content._mocksServer_fullPath;
      delete content._mocksServer_isFile;
    });
  }

  get files() {
    return this._files;
  }

  get contents() {
    return this._contents;
  }
}

module.exports = FilesHandler;
