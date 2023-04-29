/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CollectionDefinitionsLoader } from "../../mock/Mock.types";

/**  Default File Collections Loader constructor */
export interface DefaultFileCollectionsLoaderOptions {
  /** Method for loading collection definitions into the mock */
  loadCollections: CollectionDefinitionsLoader;
}

/**  Default File Collections Loader constructor */
export interface DefaultFileCollectionsLoaderConstructor {
  /**
   * Creates a Default File Collections Loader interface
   * @param options - Options {@link ConfigurationObject}
   * @returns Default File Collections Loader interface {@link DefaultFileCollectionsLoaderInterface}.
   * @example const defaultFileCollectionsLoader = new DefaultFileCollectionsLoader({ loadCollections });
   */
  new (options: DefaultFileCollectionsLoaderOptions): DefaultFileCollectionsLoaderInterface;
}

/** Load file contents from the default Mocks Server collections file and set collection definitions into the mock  */
export interface DefaultFileCollectionsLoaderInterface {} // eslint-disable-line @typescript-eslint/no-empty-interface
