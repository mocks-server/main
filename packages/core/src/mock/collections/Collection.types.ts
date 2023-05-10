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
import type { CollectionId } from "../definitions/CollectionDefinitions.types";
import type { RouteId, RouteInterface } from "../routes/Route.types";
import type { RoutesInterface } from "../routes/Routes.types";

/** Collection plain object legacy
 * @deprecated - Use {@link CollectionPlainObject} instead
 */
export interface CollectionPlainObjectLegacy {
  /** Collection id */
  id: CollectionId;

  /** Base collection from which this one inherits routes */
  from: CollectionId | null;

  /** Applied routes after calculating inheritance */
  routes: RouteId[];

  /** Routes specifically defined in the collection definition */
  definedRoutes: RouteId[];
}

/** Plain object representing a collection */
export interface CollectionPlainObject {
  /** Collection id */
  id: CollectionId;

  /** Base collection from which this one inherits routes */
  from: CollectionId | null;

  /** Applied routes after calculating inheritance */
  routes: RouteId[];

  /** Custom routes defined in run time */
  customRoutes: RouteId[];

  /** Routes specifically defined in the collection definition */
  specificRoutes: RouteId[];

  /** Routes inherited from other routes */
  inheritedRoutes: RouteId[];
}

/** Options for creating a Collection interface */
export interface CollectionOptions {
  /** Namespaced Mocks Server logger */
  alerts: AlertsInterface;
  /** Namespaced Mocks Server logger */
  logger: LoggerInterface;
  /** Collection ID */
  id: CollectionId;
  /** Collection id from which this one extends from */
  from?: CollectionId | null;
  /** Route ids specifically defined in the collection definition */
  specificRouteIds: RouteId[];
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

  /** Get collection routes */
  get routes(): RouteInterface[];

  /** Return routes added using the useRoute method */
  get customRoutes(): RouteInterface[];

  /** Return ids of custom routes */
  get customRouteIds(): RouteId[];

  /** Returns express router containing request handlers for all the collection routes */
  get router(): Router;

  /** Collection id from which this one extends from */
  get from(): CollectionId | null;

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
  resetRoutes(options?: ResetRoutesOptions): void;

  /**
   * Returns collection representation in a plain object
   * @example collection.toPlainObject();
   */
  toPlainObject(): CollectionPlainObject;
}
