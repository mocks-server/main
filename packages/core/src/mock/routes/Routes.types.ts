/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../../alerts/Alerts.types";
import type { EventListener } from "../../common/Events.types";
import type { CoreInterface } from "../../Core.types";
import type { VariantHandlerConstructor } from "../../variant-handlers/VariantHandlers.types";

import type { RouteDefinition, RouteInterface } from "./Route.types";

/** Options for creating a Routes interface */
export interface RoutesOptions {
  /** Namespaced Mocks Server alerts interface */
  alerts: AlertsInterface;
  /** Namespaced Mocks Server logger interface */
  logger: LoggerInterface;
  /** Namespaced Mocks Server config */
  config: NamespaceInterface;
  /** Callback to execute when delay changes */
  onChangeDelay: EventListener;
  /** Method to get plain routes */
  getPlainRoutes: () => RouteDefinition[];
  /** Method to get plain route variants */
  getPlainVariants: () => MocksServer.VariantDefinition[];
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
  /** Get current routes in plain format */
  get plain(): RouteDefinition[];

  /** Get current route variants in plain format */
  get plainVariants(): MocksServer.VariantDefinition[];

  /** Get value of delay configuration */
  get delay(): number;

  /**
   * Create routes from route definitions
   * @param routeDefinitions - Route definitions {@link RouteDefinition}
   * @param variantHandlers - Variant Handlers {@link VariantHandlerConstructor}
   * @example routes.loadDefinitions(routeDefinitions, variantHandlers); const routeInstances = routes.get();
   */
  loadDefinitions(
    routeDefinitions: RouteDefinition[],
    variantHandlers: VariantHandlerConstructor[]
  ): void;

  /** Return route interfaces, which are the result of loading route definitions
   * @returns Route interfaces {@link RouteInterface}
   * @example const routeInstances = routes.get();
   */
  get(): RouteInterface[];
}
