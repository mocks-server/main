/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const requireAll = require("require-all");
const watch = require("node-watch");
const fsExtra = require("fs-extra");

const { map, debounce, flatten, isObject } = require("lodash");
const JS_FILES_REGEXP = /\.json$/;

const PLUGIN_NAME = "@mocks-server/core/plugin-files-loader";
const PATH_OPTION = "path";
const DEFAULT_PATH = "mocks";

class FilesLoaderBase {
  constructor(core, methods, extraOptions = {}) {
    this._core = core;
    this._load = methods.loadMocks;
    this._onAlert = methods.addAlert;
    this._removeAlerts = methods.removeAlerts;
    this._tracer = core.tracer;
    this._settings = this._core.settings;
    this._customRequireCache = extraOptions.requireCache;

    core.addSetting({
      name: "path",
      type: "string",
      description: "Define folder from where load mocks",
      default: DEFAULT_PATH,
    });

    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  init() {
    this._core.onChangeSettings(this._onChangeSettings);
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
      this._tracer.debug("Stopping files watch");
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
      map(requireModule.children, (moduleData) => {
        if (moduleData.id.indexOf(this._path) === 0) {
          this._cleanRequireCache(this._cache()[moduleData.id]);
        }
      });
      this._cache()[requireModule.id] = undefined;
    }
  }

  _demandPathName() {
    this._tracer.error(
      `Please provide a path to the folder containing mocks using the "${PATH_OPTION}" option`
    );
    throw new Error(`Invalid option "${PATH_OPTION}"`);
  }

  _resolveFolder(folder) {
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
    const pathName = this._settings.get(PATH_OPTION);
    if (!pathName) {
      this._demandPathName();
    }
    const resolvedFolder = this._resolveFolder(pathName);
    this._path = this._ensureFolder(resolvedFolder);
    this._tracer.info(`Loading files from folder ${this._path}`);
    this._cleanRequireCacheFolder();
    try {
      this._files = requireAll({
        dirname: this._path,
        recursive: true,
        map: (fileName, filePath) => {
          if (JS_FILES_REGEXP.test(filePath)) {
            return `${fileName}.json`;
          }
          return fileName;
        },
        resolve: (fileContent) => {
          try {
            fileContent._mocksServer_isFile = true;
          } catch (error) {}
          return fileContent;
        },
      });
      this._tracer.silly(`Loaded files from folder ${this._path}`);
      this._contents = this._getContents(this._files).map((content) => {
        // TODO, remove the addition of extra properties when reading files. Define a name for the behavior.
        delete content._mocksServer_isFile;
        delete content._mocksServer_fullPath;
        return content;
      });
      this._load(this._contents);
      this._removeAlerts("load");
    } catch (error) {
      this._onAlert("load", `Error loading files from folder ${this._path}`, error);
    }
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
        Object.keys(files).forEach((key) => {
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
      Object.keys(files).forEach((childFileName) => {
        contents.push(this._getContents(files[childFileName], `${fileName}/${childFileName}`));
      });
    }
    return flatten(contents);
  }

  _switchWatch() {
    const enabled = this._settings.get("watch");
    this.stop();
    if (enabled) {
      this._tracer.debug("Starting files watcher");
      this._watcher = watch(
        this._path,
        { recursive: true },
        debounce(() => {
          this._tracer.info("File change detected");
          this._loadFiles();
        }),
        1000
      );
    }
  }

  _onChangeSettings(changeDetails) {
    if (changeDetails.hasOwnProperty(PATH_OPTION)) {
      this._loadFiles();
      this._switchWatch();
    } else if (changeDetails.hasOwnProperty("watch")) {
      this._switchWatch();
    }
  }

  _cache() {
    return this._customRequireCache || require.cache;
  }

  get displayName() {
    return PLUGIN_NAME;
  }
}

module.exports = FilesLoaderBase;
