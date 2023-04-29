/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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

/** Allows to attach loaders that will receive loaded file contents */
export interface FilesInterface {
  /** Base path where file loaders can load files from */
  get path(): string;
  /** Returns a new file contents loader
   * @param options - Options to create the loader {@link CreateFilesLoaderOptions}.
   * @returns Files loader interface {@link FilesLoaderInterface}.
   * @example const filesLoader = files.createLoader({ id, src, onLoad });
   */
  createLoader(options: CreateFilesLoaderOptions): FilesLoaderInterface;
}
