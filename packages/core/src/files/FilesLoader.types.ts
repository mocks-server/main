/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/Alerts.types";

export type FilesLoaderId = string;

/** File loaded */
export interface FileLoaded {
  /** Path of the loaded file */
  path: string;
  /** Content of the loaded file */
  content: unknown;
}

export type FilesLoaded = FileLoaded[];

/** Error loading file */
export interface ErrorLoadingFile {
  /** Path of the loaded file */
  path: string;
  /** Error received when loading file */
  error: Error;
}

export type ErrorsLoadingFiles = ErrorLoadingFile[];

export interface FilesLoaderCoreTools {
  /** Mocks Server logger namespaced using the files loader id */
  logger: LoggerInterface;
  /** Mocks Server alerts namespaced using the files loader id */
  alerts: AlertsInterface;
}

/** Callback called when files are loaded */
export interface FilesLoaderOnLoadMethod {
  /**
   * Callback called when files are loaded
   * @param filesLoaded - Array of loaded files {@link FilesLoaded}.
   * @param errorsLoadingFiles - Array of errors loading files {@link ErrorsLoadingFiles}.
   */
  (
    filesLoaded: FilesLoaded,
    errorsLoadingFiles: ErrorsLoadingFiles,
    loaderCoreTools: FilesLoaderCoreTools
  ): void;
}

/** Options for creating a Files Loader */
export interface FilesLoaderOptions {
  /** Id of the files loader */
  id: FilesLoaderId;
  /** Namespaced Mocks Server logger */
  logger: LoggerInterface;
  /** Namespaced Mocks Server alerts */
  alerts: AlertsInterface;
  /** Base path where the file loader will load files from (relative to the Mocks Server Files root path) */
  src: string;
  /** Callback to be called when files are loaded */
  onLoad: FilesLoaderOnLoadMethod;
}

/**  Files Loader constructor */
export interface FilesLoaderConstructor {
  /**
   * Creates a Files Loader interface
   * @param options - Options {@link FilesLoaderOptions}
   * @returns Files Loader interface {@link FilesLoaderInterface}.
   * @example const filesLoader = new FilesLoader({ loadCollections });
   */
  new (options: FilesLoaderOptions): FilesLoaderInterface;
}

export interface FilesLoaderInterface {
  /** Namespaced Mocks Server logger */
  get logger(): LoggerInterface;

  /** Namespaced Mocks Server alerts */
  get alerts(): AlertsInterface;

  /** Id of the files loader */
  get id(): FilesLoaderId;

  /** Base path where the file loader load files from (relative to the Mocks Server Files root path) */
  get src(): string;

  /**
   * Method to call when files are loaded
   * @param filesLoaded - Array of loaded files {@link FilesLoaded}.
   * @param errorsLoadingFiles - Array of errors loading files {@link ErrorsLoadingFiles}.
   * @example filesLoader.load(filesLoaded, errorsLoadingFiles);
   */
  load(filesLoaded: FilesLoaded, errorsLoadingFiles: ErrorsLoadingFiles): void | Promise<void>;
}
