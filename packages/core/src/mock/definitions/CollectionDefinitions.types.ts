/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { RouteId } from "../routes/types";

/** Collection id */
export type CollectionId = string;

/** Collection definition */
export interface CollectionDefinition {
  /** Collection id */
  id: CollectionId;
  /** Routes */
  routes: RouteId[];
  /** Routes
   * @deprecated Use routes instead
   */
  routeVariants?: RouteId[];
  /** Extends from collection */
  from?: CollectionId;
}

/** Normalized collection definition */
export interface CollectionDefinitionNormalized {
  /** Collection id */
  id: CollectionId;
  /** Routes */
  routes: RouteId[];
  /** Extends from collection */
  from: CollectionId | null;
}

/** Creates a collection definitions interface */
export interface CollectionDefinitionsConstructor {
  /** Returns a Collection definitions interface
   * @param options - Options to create the collection interface {@link CollectionDefinitionsOptions}.
   * @returns Collection definitions interface {@link CollectionDefinitionsInterface}.
   * @example const collectionDefinitions = new CollectionDefinitions();
   */
  new (): CollectionDefinitionsInterface;
}

/** Expose method for getting collection definitions */
export interface CollectionDefinitionsInterface {
  /** Return collections definitions */
  get(): CollectionDefinition[];

  /** Set collection definitions
   * @param collectionDefinitions - Route definitions {@link CollectionDefinition[]}.
   * @example collectionDefinitions.set(collectionDefinitionsLoaded);
   */
  set(routeDefinitions: CollectionDefinition[]): void;

  /** Return a collection definition having the provided id
   * @param id - Collection id {@link CollectionId}.
   * @returns Collection definition {@link CollectionDefinition}.
   * @example const collectionDefinition = collectionDefinitions.findById("foo");
   */
  findById(id: CollectionId): CollectionDefinition | undefined;

  /** Return normalized collections definitions */
  getNormalized(): CollectionDefinitionNormalized[];

  /** Return a normalized collection definition having the provided id
   * @param id - Collection id {@link CollectionId}.
   * @returns Collection definition normalized {@link CollectionDefinitionNormalized}.
   * @example const collectionDefinition = collectionDefinitions.findByIdAndNormalize("foo");
   */
  findByIdAndNormalize(id: CollectionId): CollectionDefinitionNormalized | undefined;
}
