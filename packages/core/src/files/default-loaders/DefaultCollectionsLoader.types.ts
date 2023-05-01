/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CollectionDefinitionsLoader } from "../../mock/Mock.types";
import type { FilesInterface } from "../Files.types";

/**  Default Collections Loader constructor */
export interface DefaultCollectionsLoaderOptions {
  /** Method for loading collection definitions into the mock */
  loadCollections: CollectionDefinitionsLoader;
  /** Method for creating a loader */
  createLoader: FilesInterface["createLoader"];
  /** Method for getting files base path */
  getBasePath: () => FilesInterface["path"];
}

/**  Default Collections Loader constructor */
export interface DefaultCollectionsLoaderConstructor {
  /**
   * Creates a Default Collections Loader interface
   * @param options - Options {@link DefaultCollectionsLoaderOptions}
   * @returns Default Collections Loader interface {@link DefaultCollectionsLoaderInterface}.
   * @example const defaultCollectionsLoader = new DefaultCollectionsLoader({ loadCollections, createLoader, getBasePath });
   */
  new (options: DefaultCollectionsLoaderOptions): DefaultCollectionsLoaderInterface;
}

/** Load file contents from the default Mocks Server collections file and set collection definitions into the mock  */
export interface DefaultCollectionsLoaderInterface {} // eslint-disable-line @typescript-eslint/no-empty-interface
