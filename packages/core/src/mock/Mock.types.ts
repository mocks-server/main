/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CollectionDefinition } from "./Collection.types";
import type {
  DefinitionsManagerInterface,
  DefinitionsLoaderInterface,
} from "./DefinitionsManager.types";
import type { RouteDefinition } from "./Route.types";

export type CollectionDefinitionsManager = DefinitionsManagerInterface<CollectionDefinition>;
export type CollectionDefinitionsLoader = DefinitionsLoaderInterface<CollectionDefinition>["load"];

export type RouteDefinitionsManager = DefinitionsManagerInterface<RouteDefinition>;
export type RouteDefinitionsLoader = DefinitionsLoaderInterface<RouteDefinition>["load"];

/** Methods allowing to load routes and collections into the mock */
export interface MockDefinitionsLoaders {
  /** Load route definitions */
  loadRoutes(): RouteDefinitionsLoader;
  /** Load collection definitions */
  loadCollections(): CollectionDefinitionsLoader;
}

export interface MockInterface {
  /** Initialize the mock interface. Compile validators, and other internal stuff */
  init(): Promise<void>;
}
