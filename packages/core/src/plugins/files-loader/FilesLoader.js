/*
Copyright 2021 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const globule = require("globule");
const watch = require("node-watch");
const fsExtra = require("fs-extra");
const { map, debounce, flatten } = require("lodash");

const {
  mocksFileToUse,
  babelRegisterDefaultOptions,
  getFilesGlobule,
  validateFileContent,
} = require("./helpers");
const { createMocksFolder } = require("../../support/scaffold");

const PLUGIN_NAME = "filesLoader";
const ROUTES_FOLDER = "routes";

const OPTIONS = [
  {
    name: "path",
    description: "Define folder from where to load mocks",
    type: "string",
    default: "mocks",
  },
  {
    name: "watch",
    description: "Enable/disable files watcher",
    type: "boolean",
    default: true,
  },
  {
    name: "babelRegister",
    description: "Load @babel/register",
    type: "boolean",
    default: false,
  },
  {
    name: "babelRegisterOptions",
    description: "Options for @babel/register",
    type: "object",
    default: {},
  },
];

class FilesLoaderBase {
  static get id() {
    return PLUGIN_NAME;
  }

  constructor(core, methods, config, extraOptions = {}) {
    this._core = core;
    this._loadMocks = methods.loadMocks;
    this._loadRoutes = methods.loadRoutes;
    this._addAlert = methods.addAlert;
    this._removeAlerts = methods.removeAlerts;
    this._tracer = core.tracer;
    this._customRequireCache = extraOptions.requireCache;
    this._require = extraOptions.require || require;

    this._config = config;

    [
      this._pathOption,
      this._watchOption,
      this._babelRegisterOption,
      this._babelRegisterOptionsOption,
    ] = this._config.addOptions(OPTIONS);
    this._pathOption.onChange(this._onChangePathOption.bind(this));
    this._watchOption.onChange(this._onChangeWatchOption.bind(this));
  }

  init() {
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

  _readFile(filePath) {
    const content = this._require(filePath);
    return (content && content.default) || content;
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

  _ensureFolder(folder) {
    if (!fsExtra.existsSync(folder)) {
      this._addAlert("load:folder", `Created folder "${folder}"`);
      createMocksFolder(folder);
    }
    return folder;
  }

  _loadFiles() {
    const pathName = this._pathOption.value;
    const resolvedFolder = this._resolveFolder(pathName);
    this._path = this._ensureFolder(resolvedFolder);
    this._tracer.info(`Loading files from folder ${this._path}`);
    if (!!this._babelRegisterOption.value) {
      this._require("@babel/register")(
        babelRegisterDefaultOptions(resolvedFolder, this._babelRegisterOptionsOption.value)
      );
    }
    this._cleanRequireCacheFolder();
    this._loadRoutesFiles();
    this._loadMocksFile();
  }

  _loadRoutesFiles() {
    const routesPath = path.resolve(this._path, ROUTES_FOLDER);
    try {
      const routeFiles = globule.find({
        src: getFilesGlobule(
          this._babelRegisterOption.value,
          this._babelRegisterOptionsOption.value
        ),
        srcBase: routesPath,
        prefixBase: true,
      });

      this._removeAlerts("load:routes");
      const routes = flatten(
        routeFiles
          .map((filePath) => {
            const fileContent = this._readFile(filePath);
            const fileErrors = validateFileContent(fileContent);
            if (!!fileErrors) {
              this._addAlert(
                `load:routes:file:${filePath}`,
                `Error loading routes from file ${filePath}: ${fileErrors}`
              );
              return null;
            }
            return fileContent;
          })
          .filter((fileContent) => !!fileContent)
      );
      this._loadRoutes(routes);
      this._tracer.silly(`Loaded routes from folder ${routesPath}`);
    } catch (error) {
      this._loadRoutes([]);
      this._addAlert("load:routes", `Error loading routes from folder ${routesPath}`, error);
    }
  }

  _loadMocksFile() {
    let mocksFile = mocksFileToUse(
      this._path,
      this._babelRegisterOption.value,
      this._babelRegisterOptionsOption.value
    );
    if (mocksFile) {
      try {
        const mocks = this._readFile(mocksFile);
        const fileErrors = validateFileContent(mocks);
        if (!!fileErrors) {
          throw new Error(fileErrors);
        }
        this._loadMocks(mocks);
        this._tracer.silly(`Loaded mocks from file ${mocksFile}`);
        this._removeAlerts("load:mocks");
      } catch (error) {
        this._loadMocks([]);
        this._addAlert("load:mocks", `Error loading mocks from file ${mocksFile}`, error);
      }
    } else {
      this._loadMocks([]);
      // TODO, add supported extensions to trace
      this._addAlert("load:mocks", `No mocks.(js|json) file was found in ${this._path}`);
    }
  }

  _switchWatch() {
    const enabled = this._watchOption.value;
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
}

module.exports = FilesLoaderBase;
