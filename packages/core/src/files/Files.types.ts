/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/Alerts.types";
import type { CollectionDefinitionsLoader, RouteDefinitionsLoader } from "../mock/Mock.types";

import type {
  FilesLoaderInterface,
  FilesLoaderId,
  FilesLoaderOnLoadMethod,
} from "./FilesLoader.types";

/** Options for creating a files loader */
export interface CreateFilesLoaderOptions {
  /** Id of the loader */
  id: FilesLoaderId;
  /** Base path where the file loader will load files from (relative to the Mocks Server Files root path) */
  src: string;
  /** Callback called when files are loaded */
  onLoad: FilesLoaderOnLoadMethod;
}

/** Options for creating a files interface */
export interface FilesOptions {
  /** Namespaced Mocks Server config */
  config: NamespaceInterface;
  /** Namespaced Mocks Server logger */
  logger: LoggerInterface;
  /** Namespaced Mocks Server alerts */
  alerts: AlertsInterface;
  /** Method for loading collection definitions into the mock */
  loadCollections: CollectionDefinitionsLoader;
  /** Method for loading route definitions into the mock */
  loadRoutes: RouteDefinitionsLoader;
}

/** Advanced Options for creating a files interface. Used mainly for testing */
export interface FilesExtraOptions {
  /** Require function */
  require?: NodeRequire;
  /** Custom require cache */
  requireCache?: NodeJS.Require["cache"];
}

export type FilesLoaders = Record<string, FilesLoaderInterface>;

/** Creates a Files interface */
export interface FilesConstructor {
  /** Unique identifier of Files class. Used for logging and alerts namespaces */
  get id(): string;
  /** Returns a Files interface
   * @param options - Options to create the files interface {@link FilesOptions}.
   * @returns Files interface {@link FilesInterface}.
   * @example const files = new Files({ config, loadCollections, logger, loadRoutes, alerts });
   */
  new (options: FilesOptions, extraOptions: FilesExtraOptions): FilesInterface;
}

/** Allows to attach loaders that will receive loaded file contents */
export interface FilesInterface {
  /** Base path where file loaders can load files from */
  get path(): string;

  /**
   * Initialize files instance. Create default collections and routes loaders and load files
   * @example await files.init();
   */
  init(): Promise<void>;

  /**
   * Reload files
   * @example await files.reload();
   */
  reload(): Promise<void>;

  /**
   * Start watching files for changes (only if config.watch is true)
   * @example await files.start();
   */
  start(): void;

  /**
   * Stop watching files for changes
   * @example await files.stop();
   */
  stop(): void;

  /** Returns a new file contents loader
   * @param options - Options to create the loader {@link CreateFilesLoaderOptions}.
   * @returns Files loader interface {@link FilesLoaderInterface}.
   * @example const filesLoader = files.createLoader({ id, src, onLoad });
   */
  createLoader(options: CreateFilesLoaderOptions): FilesLoaderInterface;

  /** Returns registered files loaders **/
  get loaders(): FilesLoaders;
}
