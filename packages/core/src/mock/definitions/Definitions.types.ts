/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  CollectionDefinition,
  CollectionDefinitionsInterface,
} from "./CollectionDefinitions.types";
import type { DefinitionsLoaderInterface } from "./DefinitionLoadersManager.types";
import type { RouteDefinition, RouteDefinitionsInterface } from "./RouteDefinitions.types";

export interface DefinitionsOptions {
  /** Function to be called when definitions are loaded */
  onLoad: () => void;
}

/** Creates a definitions interface */
export interface DefinitionsConstructor {
  /**
   * Creates a definition loaders manager interface
   * @param options - Options {@link DefinitionsOptions}
   * @returns Definition interface {@link DefinitionsInterface}.
   * @example const definitions = new Definitions({ onLoad: () => console.log("Definitions loaded")});
   */
  new (options: DefinitionsOptions): DefinitionsInterface;
}

/** Methods for loading definitions */
export interface DefinitionsLoaders {
  loadRoutes: DefinitionsLoaderInterface<RouteDefinition>["load"];
  loadCollections: DefinitionsLoaderInterface<CollectionDefinition>["load"];
}

/** Create definition loaders and expose interfaces for collections and routes definitions */
export interface DefinitionsInterface {
  /** Collection definitions interface */
  get collections(): CollectionDefinitionsInterface;

  /** Route definitions interface */
  get routes(): RouteDefinitionsInterface;

  /** Return loaders for loading definitions */
  createLoaders(): DefinitionsLoaders;
}
