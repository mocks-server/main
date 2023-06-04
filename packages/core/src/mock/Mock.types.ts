/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ConfigNamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/types";
import type { EventListener, EventListenerRemover } from "../common/types";
import type { NextFunction, Request, Response } from "../server/types";
import type { VariantHandlerConstructor } from "../variant-handlers/types";

import type { CoreInterface } from "../Core.types";

import type { CollectionsInterface } from "./collections/types";
import type {
  CollectionDefinition,
  DefinitionLoadersManagerInterface,
  DefinitionsLoaderInterface,
  DefinitionsInterface,
  DefinitionsLoaders,
  RouteDefinition,
} from "./definitions/types";
import type { RouteId, RoutesInterface } from "./routes/types";

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ConfigMockNamespace {}

    interface Config {
      mock?: ConfigMockNamespace;
    }
  }
}

export type CollectionDefinitionsManager = DefinitionLoadersManagerInterface<CollectionDefinition>;
export type CollectionDefinitionsLoader = DefinitionsLoaderInterface<CollectionDefinition>["load"];

export type RouteDefinitionsManager = DefinitionLoadersManagerInterface<RouteDefinition>;
export type RouteDefinitionsLoader = DefinitionsLoaderInterface<RouteDefinition>["load"];

/** Methods allowing to load routes and collections into the mock */
export interface MockDefinitionsLoaders {
  /** Load route definitions */
  loadRoutes(): RouteDefinitionsLoader;
  /** Load collection definitions */
  loadCollections(): CollectionDefinitionsLoader;
}

/** Options for creating a Mock interface */
export interface MockOptions {
  /** Namespaced Mocks Server alerts interface */
  alerts: AlertsInterface;
  /** Namespaced Mocks Server logger interface */
  logger: LoggerInterface;
  /** Namespaced Mocks Server config */
  config: ConfigNamespaceInterface;
  /**
   * Callback to execute when the mock changes
   * @deprecated Use onChange instead
   * */
  onChange: EventListener;
}

/** Creates a Mock interface */
export interface MockConstructor {
  /** Returns a Routes interface
   * @param options - Options to create the mock interface {@link MockOptions}.
   * @returns Mock interface {@link MockInterface}.
   * @example const mock = new Mock({ config, loadCollections, logger, loadRoutes, alerts });
   */
  new (options: MockOptions, core: CoreInterface): MockInterface;
  /** Unique identifier of Routes class. Used for logging and alerts namespaces */
  get id(): string;
}

export interface MockInterface {
  /** Express router with current collection routes
   * @param req - Request object {@link Request}
   * @param res - Response object {@link Response}
   * @param next - Next function {@link NextFunction}
   */
  router(req: Request, res: Response, next: NextFunction): void;

  /** Initialize the mock interface. Compile validators, and other internal stuff
   * @param variantHandlers - Registered Variant Handler classes {@link VariantHandlerConstructor[]}
   * @example mock.init(variantHandlers);
   */
  init(variantHandlers: VariantHandlerConstructor[]): Promise<void>;

  /** Reset custom routes defined in the current collection
   * @deprecated Use mock.collections.current.resetRoutes() instead
   */
  restoreRouteVariants(): void;

  /** Reset custom routes defined in the current collection
   * @deprecated Use mock.collections.current.resetRoutes() instead
   */
  /**
   * Set a route id to be used by the current collection. The route variant will be placed at the same position as any other route variant belonging to the same route.
   * @param routeId - Route id {@link RouteId}
   * @example mock.useRouteVariant("my-route:variant-id");
   * @deprecated Use mock.collections.current.useRouteVariant() instead
   */
  useRouteVariant(routeId: RouteId): void;

  /** Return loaders for loading definitions
   * @deprecated Use mock.definitions.createLoaders() instead
   */
  createLoaders(): DefinitionsLoaders;

  /**
   * Attach an event listener to be executed when the mock changes
   * @param listener - Event listener {@link EventListener}
   * @returns Function to remove the listener {@link EventListenerRemover}
   * */
  onChange(listener: EventListener): EventListenerRemover;

  /** Returns routes object
   * @returns Routes object {@link RoutesInterface}
   */
  get routes(): RoutesInterface;

  /** Returns collections object
   * @returns Collections object {@link CollectionsInterface}
   */
  get collections(): CollectionsInterface;

  /** Returns definitions object
   * @returns Definitions object {@link DefinitionsInterface}
   */
  get definitions(): DefinitionsInterface;

  /** Returns legacy custom route variants
   * @returns Array of route ids {@link RouteId[]}
   * @deprecated Use mock.collections.current.customRouteIds instead
   */
  get customRouteVariants(): RouteId[];
}
