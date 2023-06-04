/*
Copyright 2021-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import type { RegisterOptions } from "@babel/register";
import type {
  ConfigNamespaceInterface,
  OptionInterfaceOfType,
  OptionDefinition,
  UnknownObject,
} from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import { ensureDirSync, existsSync } from "fs-extra";
import globule from "globule";
import isPromise from "is-promise";
import { map, debounce, isFunction } from "lodash";
import watch from "node-watch";

import type { AlertsInterface } from "../alerts/types";

import { DefaultCollectionsLoader, DefaultRoutesLoader } from "./default-loaders";
import type {
  DefaultCollectionsLoaderInterface,
  DefaultRoutesLoaderInterface,
} from "./default-loaders/types";
import { FilesLoader } from "./FilesLoader";
import {
  babelRegisterDefaultOptions,
  getFilesGlobule,
  isYamlFile,
  readYamlFile,
  isFileLoaded,
  isErrorLoadingFile,
} from "./Helpers";

import type {
  CreateFilesLoaderOptions,
  FilesConstructor,
  FilesExtraOptions,
  FilesInterface,
  FilesOptions,
  FilesLoaders,
  FilesEnabledOptionDefinition,
  FilesPathOptionDefinition,
  FilesWatchOptionDefinition,
  BabelEnabledOptionDefinition,
  BabelConfigOptionDefinition,
} from "./Files.types";
import type { FilesLoaderInterface, FileLoaded, ErrorLoadingFile } from "./FilesLoader.types";

const OPTIONS: [
  FilesEnabledOptionDefinition,
  FilesPathOptionDefinition,
  FilesWatchOptionDefinition
] = [
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

const BABEL_REGISTER_OPTIONS: [BabelEnabledOptionDefinition, BabelConfigOptionDefinition] = [
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

export const Files: FilesConstructor = class Files implements FilesInterface {
  private _loaders: FilesLoaders;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _loadCollections: FilesOptions["loadCollections"];
  private _loadRoutes: FilesOptions["loadRoutes"];
  private _loggerLoaders: LoggerInterface;
  private _alertsLoaders: AlertsInterface;
  private _alertsLoad: AlertsInterface;
  private _config: ConfigNamespaceInterface;
  private _enabledOption: OptionInterfaceOfType<boolean, { hasDefault: true }>;
  private _pathOption: OptionInterfaceOfType<string, { hasDefault: true }>;
  private _watchOption: OptionInterfaceOfType<boolean, { hasDefault: true }>;
  private _babelRegisterOption: OptionInterfaceOfType<boolean, { hasDefault: true }>;
  private _babelRegisterOptionsOption: OptionInterfaceOfType<
    RegisterOptions,
    { hasDefault: true }
  >;
  private _collectionsLoader: DefaultCollectionsLoaderInterface;
  private _routesLoader: DefaultRoutesLoaderInterface;
  private _enabled: boolean;
  private _watcher: ReturnType<typeof watch> | null;
  private _require: NodeRequire;
  private _path: string;
  private _customRequireCache?: FilesExtraOptions["requireCache"];

  static get id(): string {
    return "files";
  }

  constructor(
    { config, loadCollections, logger, loadRoutes, alerts }: FilesOptions,
    extraOptions: FilesExtraOptions = {}
  ) {
    this._loaders = {};
    this._logger = logger;
    this._alerts = alerts;
    this._loadCollections = loadCollections;
    this._loadRoutes = loadRoutes;
    this._watcher = null;

    this._loggerLoaders = this._logger.namespace("loader");
    this._alertsLoaders = alerts.collection("loader");
    this._alertsLoad = alerts.collection("load");

    this._customRequireCache = extraOptions.requireCache;
    this._require = extraOptions.require || require;
    this._config = config;

    [this._enabledOption, this._pathOption, this._watchOption] = this._config.addOptions(
      OPTIONS
    ) as [
      OptionInterfaceOfType<boolean, { hasDefault: true }>,
      OptionInterfaceOfType<string, { hasDefault: true }>,
      OptionInterfaceOfType<boolean, { hasDefault: true }>
    ];
    [this._babelRegisterOption, this._babelRegisterOptionsOption] = this._config
      .addNamespace(BABEL_REGISTER_NAMESPACE)
      .addOptions(BABEL_REGISTER_OPTIONS) as [
      OptionInterfaceOfType<boolean, { hasDefault: true }>,
      OptionInterfaceOfType<RegisterOptions, { hasDefault: true }>
    ];
    this._pathOption.onChange(this._onChangePathOption.bind(this));
    this._watchOption.onChange(this._onChangeWatchOption.bind(this));

    this._loadLoader = this._loadLoader.bind(this);
    this.createLoader = this.createLoader.bind(this);
  }

  public async init(): Promise<void> {
    this._collectionsLoader = new DefaultCollectionsLoader({
      loadCollections: this._loadCollections,
      createLoader: this.createLoader,
      getBasePath: this._getPath.bind(this),
    });
    this._routesLoader = new DefaultRoutesLoader({
      loadRoutes: this._loadRoutes,
      createLoader: this.createLoader,
      getBasePath: this._getPath.bind(this),
    });
    this._enabled = this._enabledOption.value;
    if (this._enabled) {
      try {
        await this._loadFiles();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }

  public async reload(): Promise<void> {
    await this._loadFiles();
  }

  public start(): void {
    if (this._enabled) {
      this._switchWatch();
    }
  }

  public stop(): void {
    if (this._enabled && this._watcher) {
      this._logger.debug("Stopping files watch");
      this._watcher.close();
    }
  }

  private async _readFile(filePath: string): Promise<unknown> {
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
            const promiseToWait = exportedContentResult as Promise<unknown>;
            promiseToWait
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

  private _cleanRequireCacheFolder(): void {
    map(this._cache(), (_cacheData, filePath) => {
      if (filePath.indexOf(this._path) === 0) {
        this._cleanRequireCache(this._cache()[filePath]);
      }
    });
  }

  private _cleanRequireCache(nodeModule?: NodeModule): void {
    if (nodeModule) {
      map(nodeModule.children, (moduleData) => {
        if (moduleData.id.indexOf(this._path) === 0) {
          this._cleanRequireCache(this._cache()[moduleData.id]);
        }
      });
      this._cache()[nodeModule.id] = undefined;
    }
  }

  private _resolveFolder(folder: string): string {
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  private _getPath(): string {
    const pathName = this._pathOption.value;
    return this._resolveFolder(pathName);
  }

  public get path(): string {
    return this._getPath();
  }

  private _ensurePath(): void {
    if (!existsSync(this._path)) {
      this._alerts.set("folder", `Created folder '${this._path}'`);
      ensureDirSync(this._path);
    }
  }

  private async _loadFiles(): Promise<void> {
    this._path = this._getPath();
    this._ensurePath();
    this._logger.info(`Loading files from folder ${this._path}`);
    if (this._babelRegisterOption.value) {
      this._require("@babel/register")(
        babelRegisterDefaultOptions(this._path, this._babelRegisterOptionsOption.value)
      );
    }
    this._cleanRequireCacheFolder();
    await this._loadLoaders();
  }

  private async _loadLoaders(): Promise<void> {
    this._alertsLoad.clean();
    await Promise.all(map(this._loaders, this._loadLoader));
  }

  private async _loadLoader(loader: FilesLoaderInterface): Promise<void> {
    const filesToLoad = globule.find(
      getFilesGlobule(
        loader.src,
        this._babelRegisterOption.value,
        this._babelRegisterOptionsOption.value
      ),
      {
        srcBase: this._getPath(),
        prefixBase: true,
      }
    );

    this._logger.silly(`Files to load for loader '${loader.id}': ${JSON.stringify(filesToLoad)}`);

    await Promise.all(
      filesToLoad.map((filePath) => {
        return this._readFile(filePath)
          .then((fileContent): FileLoaded => {
            return {
              path: filePath,
              content: fileContent,
            };
          })
          .catch((error): Promise<ErrorLoadingFile> => {
            const fileError = error as Error;
            this._alertsLoad.set(filePath, `Error loading file ${filePath}`, error);
            return Promise.resolve({
              path: filePath,
              error: fileError,
            });
          });
      })
    ).then((filesDetails) => {
      const loadedFiles = filesDetails.filter(isFileLoaded);
      const erroredFiles = filesDetails.filter(isErrorLoadingFile);

      let loadProcess;
      try {
        loadProcess = loader.load(loadedFiles, erroredFiles);
      } catch (error) {
        this._alertsLoad.set(loader.id, `Error processing loaded files`, error as Error);
      }
      if (isPromise(loadProcess)) {
        const promiseToWait = loadProcess as Promise<unknown>;
        return promiseToWait.catch((error) => {
          this._alertsLoad.set(loader.id, `Error processing loaded files`, error);
          return Promise.resolve();
        });
      }
      return Promise.resolve();
    });
  }

  private _switchWatch(): void {
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

  private _onChangePathOption(): void {
    this._loadFiles();
    this._switchWatch();
  }

  private _onChangeWatchOption(): void {
    this._switchWatch();
  }

  private _cache(): NodeJS.Dict<NodeModule> {
    return (this._customRequireCache || require.cache) as NodeJS.Require["cache"];
  }

  public createLoader({ id, src, onLoad }: CreateFilesLoaderOptions): FilesLoaderInterface {
    this._logger.debug(`Creating files loader '${id}'`);
    this._loaders[id] = new FilesLoader({
      id,
      alerts: this._alertsLoaders.collection(id),
      logger: this._loggerLoaders.namespace(id),
      src,
      onLoad,
    });
    return this._loaders[id];
  }

  public get loaders(): FilesLoaders {
    return { ...this._loaders };
  }
};
