/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../../alerts/Alerts.types";
import type { EventListener } from "../../common/Events.types";
import type { Router } from "../../server/Server.types";
import type { RouteId, RouteInterface } from "../routes/Route.types";
import type { RoutesInterface } from "../routes/Routes.types";

/** Collection id */
export type CollectionId = string;

/** Collection definition */
export interface CollectionDefinition {
  /** Collection id */
  id: CollectionId;
  /** Routes */
  routes: RouteId[];
  /** Extends from collection */
  from?: CollectionId;
}

/** Options for creating a Collection interface */
export interface CollectionOptions {
  /** Namespaced Mocks Server logger */
  alerts: AlertsInterface;
  /** Namespaced Mocks Server logger */
  logger: LoggerInterface;
  /** Collection ID */
  id: CollectionId;
  /** Route variants */
  routes: RouteInterface[]; // TODO, rename property to routeHandlers
  /** Method to get current delay */
  routesManager: RoutesInterface;
  /** Callback to execute when collection changes */
  onChange: EventListener;
}

/** Options for resetting collection routes */
export interface ResetRoutesOptions {
  silent?: boolean;
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
  get routes(): RouteInterface[]; // TODO, rename property to routeHandlers

  /** Returns express router containing request handlers for all the collection route variants */
  get router(): Router;

  /**
   * Set a route id to be used by the collection. The route variant will be placed at the same position as any other route variant belonging to the same route.
   * @param routeId - Route id {@link RouteId}
   * @example collection.useRoute("my-route:variant-id");
   */
  useRoute(routeId: RouteId): void;

  /**
   * Restore collection routes to the initial state (undo all the changes made by useRoute method)
   * @param options - Options for resetting routes {@link ResetRoutesOptions}
   * @example collection.resetRoutes();
   */
  resetRoutes(options: ResetRoutesOptions): void;
}
