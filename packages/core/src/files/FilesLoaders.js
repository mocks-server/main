/*
Copyright 2021-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const globule = require("globule");
const watch = require("node-watch");
const fsExtra = require("fs-extra");
const { map, debounce, isFunction } = require("lodash");
const isPromise = require("is-promise");

const CollectionsLoader = require("./loaders/Collections");
const RoutesLoader = require("./loaders/Routes");
const Loader = require("./Loader");

const {
  babelRegisterDefaultOptions,
  getFilesGlobule,
  isYamlFile,
  readYamlFile,
} = require("./helpers");

const OPTIONS = [
  {
    name: "enabled",
    description: "Allows to disable files load",
    type: "boolean",
    default: true,
  },
  {
    name: "path",
    description: "Define folder from where to load collections and routes",
    type: "string",
    default: "mocks",
  },
  {
    name: "watch",
    description: "Enable/disable files watcher",
    type: "boolean",
    default: true,
  },
];

const BABEL_REGISTER_NAMESPACE = "babelRegister";

const BABEL_REGISTER_OPTIONS = [
  {
    name: "enabled",
    description: "Load @babel/register",
    type: "boolean",
    default: false,
  },
  {
    name: "options",
    description: "Options for @babel/register",
    type: "object",
    default: {},
  },
];

class FilesLoaders {
  static get id() {
    return "files";
  }

  constructor({ config, loadCollections, logger, loadRoutes, alerts }, extraOptions = {}) {
    this._loaders = {};
    this._logger = logger;
    this._alerts = alerts;
    this._loadCollections = loadCollections;
    this._loadRoutes = loadRoutes;

    this._loggerLoaders = this._logger.namespace("loader");
    this._alertsLoaders = alerts.collection("loader");
    this._alertsLoad = alerts.collection("load");

    this._customRequireCache = extraOptions.requireCache;
    this._require = extraOptions.require || require;
    this._config = config;

    [this._enabledOption, this._pathOption, this._watchOption] = this._config.addOptions(OPTIONS);
    [this._babelRegisterOption, this._babelRegisterOptionsOption] = this._config
      .addNamespace(BABEL_REGISTER_NAMESPACE)
      .addOptions(BABEL_REGISTER_OPTIONS);
    this._pathOption.onChange(this._onChangePathOption.bind(this));
    this._watchOption.onChange(this._onChangeWatchOption.bind(this));

    this._loadLoader = this._loadLoader.bind(this);
    this.createLoader = this.createLoader.bind(this);
  }

  init() {
    this._collectionsLoader = new CollectionsLoader({
      loadCollections: this._loadCollections,
      createLoader: this.createLoader,
      getBasePath: this._getPath.bind(this),
    });
    this._routesLoader = new RoutesLoader({
      loadRoutes: this._loadRoutes,
      createLoader: this.createLoader,
      getBasePath: this._getPath.bind(this),
    });
    this._enabled = this._enabledOption.value;
    if (this._enabled) {
      try {
        return this._loadFiles();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }

  reload() {
    return this._loadFiles();
  }

  start() {
    if (this._enabled) {
      this._switchWatch();
    }
  }

  stop() {
    if (this._enabled && this._watcher) {
      this._logger.debug("Stopping files watch");
      this._watcher.close();
    }
  }

  _readFile(filePath) {
    if (isYamlFile(filePath)) {
      this._logger.debug(`Reading yaml file ${filePath}`);
      return readYamlFile(filePath);
    }
    this._logger.debug(`Reading file ${filePath}`);
    return new Promise((resolve, reject) => {
      try {
        const content = this._require(filePath);
        const exportedContent = (content && content.default) || content;
        if (isFunction(exportedContent)) {
          this._logger.debug(
            `Function exported by '${filePath}'. Executing it to return its result`
          );
          const exportedContentResult = exportedContent();
          if (isPromise(exportedContentResult)) {
            this._logger.debug(
              `Function in '${filePath}' returned a promise. Waiting for it to resolve its result`
            );
            exportedContentResult
              .then((exportedContentPromiseResult) => {
                this._logger.silly(`Promise in '${filePath}' was resolved`);
                resolve(exportedContentPromiseResult);
              })
              .catch((error) => {
                this._logger.silly(`Promise in '${filePath}' was rejected`);
                reject(error);
              });
          } else {
            resolve(exportedContentResult);
          }
        } else {
          resolve(exportedContent);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  _cleanRequireCacheFolder() {
    map(this._cache(), (_cacheData, filePath) => {
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

  _resolveFolder(folder) {
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  _getPath() {
    const pathName = this._pathOption.value;
    return this._resolveFolder(pathName);
  }

  get path() {
    return this._getPath();
  }

  _ensurePath() {
    if (!fsExtra.existsSync(this._path)) {
      this._alerts.set("folder", `Created folder '${this._path}'`);
      fsExtra.ensureDirSync(this._path);
    }
  }

  _loadFiles() {
    this._path = this._getPath();
    this._ensurePath();
    this._logger.info(`Loading files from folder ${this._path}`);
    if (!!this._babelRegisterOption.value) {
      this._require("@babel/register")(
        babelRegisterDefaultOptions(this._path, this._babelRegisterOptionsOption.value)
      );
    }
    this._cleanRequireCacheFolder();
    return this._loadLoaders();
  }

  _loadLoaders() {
    this._alertsLoad.clean();
    return Promise.all(map(this._loaders, this._loadLoader));
  }

  _loadLoader(loader) {
    const filesToLoad = globule.find({
      src: getFilesGlobule(
        loader.src,
        this._babelRegisterOption.value,
        this._babelRegisterOptionsOption.value
      ),
      srcBase: this._getPath(),
      prefixBase: true,
    });

    this._logger.silly(`Files to load for loader '${loader.id}': ${JSON.stringify(filesToLoad)}`);

    return Promise.all(
      filesToLoad.map((filePath) => {
        return this._readFile(filePath)
          .then((fileContent) => {
            return {
              path: filePath,
              content: fileContent,
            };
          })
          .catch((error) => {
            this._alertsLoad.set(filePath, `Error loading file ${filePath}`, error);
            return Promise.resolve({
              path: filePath,
              error,
            });
          });
      })
    ).then((filesDetails) => {
      const loadedFiles = filesDetails.filter((fileDetails) => !!fileDetails.content);
      const erroredFiles = filesDetails.filter((fileDetails) => !!fileDetails.error);
      const loadProcess = loader.load(loadedFiles, erroredFiles, {
        alerts: loader.alerts,
        logger: loader.logger,
      });
      if (isPromise(loadProcess)) {
        return loadProcess.catch((error) => {
          this._alertsLoad.set(loader.id, `Error proccesing loaded files`, error);
          return Promise.resolve();
        });
      }
      return Promise.resolve();
    });
  }

  _switchWatch() {
    const enabled = this._watchOption.value;
    this.stop();
    if (enabled) {
      this._logger.debug("Starting files watcher");
      this._watcher = watch(
        this._path,
        { recursive: true },
        debounce(
          () => {
            this._logger.info("File change detected");
            this._loadFiles();
          },
          200,
          { maxWait: 1000 }
        )
      );
    }
  }

  _onChangePathOption() {
    this._loadFiles();
    this._switchWatch();
  }

  _onChangeWatchOption() {
    this._switchWatch();
  }

  _cache() {
    return this._customRequireCache || require.cache;
  }

  createLoader({ id, src, onLoad }) {
    this._logger.debug(`Creating files loader '${id}'`);
    this._loaders[id] = new Loader({
      id,
      alerts: this._alertsLoaders.collection(id),
      logger: this._loggerLoaders.namespace(id),
      src,
      onLoad,
    });
    return this._loaders[id];
  }

  get loaders() {
    return { ...this._loaders };
  }
}

module.exports = FilesLoaders;
