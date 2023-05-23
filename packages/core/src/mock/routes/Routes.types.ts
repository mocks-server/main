/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ConfigNamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../../alerts/types";
import type { EventListener } from "../../common/types";
import type { CoreInterface } from "../../Core.types";
import type { VariantHandlerConstructor } from "../../variant-handlers/types";
import type { RouteDefinition } from "../definitions/types";

import type {
  RouteInterface,
  RouteId,
  RoutePlainObject,
  RoutePlainObjectLegacy,
  RouteVariantPlainObjectLegacy,
} from "./Route.types";

/** Options for creating a Routes interface */
export interface RoutesOptions {
  /** Namespaced Mocks Server alerts interface */
  alerts: AlertsInterface;
  /** Namespaced Mocks Server logger interface */
  logger: LoggerInterface;
  /** Namespaced Mocks Server config */
  config: ConfigNamespaceInterface;
  /** Callback to execute when routes change. Event is emitted when delay option changes */
  onChange: EventListener;
}

/** Creates a Routes interface */
export interface RoutesConstructor {
  /** Unique identifier of Routes class. Used for logging and alerts namespaces */
  get id(): string;

  /** Returns a Routes interface
   * @param options - Options to create the routes interface {@link RoutesOptions}.
   * @returns Routes interface {@link RoutesInterface}.
   * @example const routes = new Routes({ config, loadCollections, logger, loadRoutes, alerts });
   */
  new (options: RoutesOptions, core: CoreInterface): RoutesInterface;
}

/** Interface for managing Mocks Server routes. Currently it does not have almost responsibility, but this has to be refactored. TODO: Migrate routes responsibility to this interface */
export interface RoutesInterface {
  /** Get value of delay configuration */
  get delay(): number;

  /** Get logger */
  get logger(): LoggerInterface;

  /**
   * Create routes from route definitions
   * @param routeDefinitions - Route definitions {@link RouteDefinition}
   * @param variantHandlers - Variant Handlers {@link VariantHandlerConstructor}
   * @example routes.load(routeDefinitions, variantHandlers); const routeInstances = routes.get();
   */
  load(routeDefinitions: RouteDefinition[], variantHandlers: VariantHandlerConstructor[]): void;

  /** Return route interfaces, which are the result of loading route definitions
   * @returns Route interfaces {@link RouteInterface}
   * @example const routeInstances = routes.get();
   */
  get(): RouteInterface[];

  /** Find and return a route interface by id
   * @param id - Route id {@link RouteId}
   * @returns Route interface {@link RouteInterface}
   * @example const route = routes.findById("my-route:variant-id");
   */
  findById(id: RouteId): RouteInterface | undefined;

  /**
   * Returns an array of route representations as plain objects
   * @example routes.toPlainObject();
   */
  toPlainObject(): RoutePlainObject[];

  /**
   * Returns array of route representations as legacy plain objects
   * @example routes.plain;
   * @deprecated Use routes.toPlainObject instead
   */
  get plain(): RoutePlainObjectLegacy[];

  /**
   * Returns array of route variants representations as legacy plain objects
   * @example routes.plainVariants;
   * @deprecated Use routes.toPlainObject instead
   */
  get plainVariants(): RouteVariantPlainObjectLegacy[];
}
