/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { Router } from "../server/Server.types";

import type { RouteInterface } from "./Route.types";

/** Collection id */
export type CollectionId = string;

/** Collection definition */
export interface CollectionDefinition {
  /** Collection id */
  id: CollectionId;
}

/** Options for creating a Collection interface */
export interface CollectionOptions {
  /** Collection ID */
  id: CollectionId;
  /** Namespaced Mocks Server config */
  config: NamespaceInterface;
  /** Namespaced Mocks Server config */
  logger: LoggerInterface;
  /** Route variants */
  routeVariants: RouteInterface[]; // TODO, rename property to routeHandlers
  /** Method to get current delay */
  getDelay: () => number; // TODO, relation with delay Type when config accepts types
}

/** Creates a Collection interface */
export interface CollectionConstructor {
  /** Returns a Collection interface
   * @param options - Options to create the collection interface {@link CollectionOptions}.
   * @returns Collection interface {@link CollectionInterface}.
   * @example const collection = new Collection({ id, config, logger, routeVariants, getDelay });
   */
  new (options: CollectionOptions): CollectionInterface;
}

/** Collection of route handlers. It creates a router containing the corresponding express middleWares for route variants */
export interface CollectionInterface {
  /** Collection id */
  get id(): CollectionId;

  /** Get collection route variants */
  get routeVariants(): RouteInterface[]; // TODO, rename property to routeHandlers

  /** Returns express router containing request handlers for all the collection route variants */
  get router(): Router;
}
