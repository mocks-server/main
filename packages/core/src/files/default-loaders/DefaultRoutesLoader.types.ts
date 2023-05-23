/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { RouteDefinitionsLoader } from "../../mock/types";
import type { FilesInterface } from "../Files.types";

/**  Default Routes Loader constructor */
export interface DefaultRoutesLoaderOptions {
  /** Method for loading route definitions into the mock */
  loadRoutes: RouteDefinitionsLoader;
  /** Method for creating a loader */
  createLoader: FilesInterface["createLoader"];
  /** Method for getting files base path */
  getBasePath: () => FilesInterface["path"];
}

/**  Default Routes Loader constructor */
export interface DefaultRoutesLoaderConstructor {
  /**
   * Creates a Default Routes Loader interface
   * @param options - Options {@link DefaultRoutesLoaderOptions}
   * @returns Default Routes Loader interface {@link DefaultRoutesLoaderInterface}.
   * @example const defaultRoutesLoader = new DefaultRoutesLoader({ loadRoutes, createLoader, getBasePath });
   */
  new (options: DefaultRoutesLoaderOptions): DefaultRoutesLoaderInterface;
}

/** Load file contents from the default Mocks Server routes folder and set route definitions into the mock  */
export interface DefaultRoutesLoaderInterface {} // eslint-disable-line @typescript-eslint/no-empty-interface
