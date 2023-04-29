/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  ResourcesManagerInterface,
  ResourcesLoaderInterface,
} from "./ResourcesManager.types";

export interface CollectionDefinition {
  id: string;
}

export interface RoutesDefinition {
  id: string;
}

export type CollectionDefinitionsManager = ResourcesManagerInterface<CollectionDefinition>;
export type RouteDefinitionsManager = ResourcesManagerInterface<RoutesDefinition>;

export type CollectionDefinitionsLoader = ResourcesLoaderInterface<RoutesDefinition>["load"];
export type RouteDefinitionsLoader = ResourcesLoaderInterface<RoutesDefinition>["load"];

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
