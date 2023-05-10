/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { RequestHandlerHttpMethod } from "../../server/Server.types";
import type {
  VariantHandlerInterface,
  VariantHandlerResponsePreview,
} from "../../variant-handlers/VariantHandlers.types";
import type {
  RouteDefinitionId,
  RouteDefinitionHTTPMethod,
} from "../definitions/RouteDefinitions.types";

export type RouteId = `${RouteDefinitionId}:${MocksServer.VariantDefinitionId}`;

/** Route variant plain object legacy
 * @deprecated - Use {@link RoutePlainObject} instead
 */
export interface RouteVariantPlainObjectLegacy {
  id: RouteId;
  disabled: boolean;
  route: RouteDefinitionId;
  type: MocksServer.VariantHandlerTypes | null;
  preview?: VariantHandlerResponsePreview | null;
  delay: number | null;
}

/** Collection plain object legacy
 * @deprecated - Use {@link RoutePlainObject} instead
 */
export interface RoutePlainObjectLegacy {
  /** Route definition id */
  id: RouteDefinitionId;
  /** Url */
  url: string;
  /** Method */
  method: RequestHandlerHttpMethod[];
  /** Route delay */
  delay: null | number;
  /** Ids of other routes created from the same route definition */
  variants: RouteId[];
}

/** Plain object representing a route */
export interface RoutePlainObject {
  /** Collection id */
  id: RouteId;

  /** Route method */
  methods: RequestHandlerHttpMethod[];

  /** Route path */
  path: string;

  /** Route delay */
  delay: number | null;

  /** Route id disabled */
  disabled: boolean;

  /** Variant handler type */
  type: MocksServer.VariantHandlerTypes | null;

  /** Response preview */
  preview?: VariantHandlerResponsePreview | null;

  /** Data about the definition used to create this route */
  definition: {
    /** Id of the route definition from which the route was created */
    route: RouteDefinitionId;
    /** Id of the route variant definition from which the route was created */
    variant: MocksServer.VariantDefinitionId;
  };
}

/** Options for creating a new Route */
export interface RouteOptions {
  /** Route id */
  id: RouteId;
  /** Route delay */
  delay: number | null;
  /** Route id disabled */
  disabled: boolean;
  /** Route variant definition id */
  variantId: MocksServer.VariantDefinitionId;
  /** Route definition id */
  routeId: RouteDefinitionId;
  /** Route path */
  path: string;
  /** Route method */
  method: RouteDefinitionHTTPMethod;
  /** Route logger */
  logger: LoggerInterface;
  /** Route variant handler */
  handler?: VariantHandlerInterface;
  /** Variant handler type */
  type?: MocksServer.VariantHandlerTypes;
  /** Response preview */
  preview?: VariantHandlerResponsePreview | null;
}

/** Route handler constructor */
export interface RouteConstructor {
  /**
   * Creates a Route interface
   * @param options - Options {@link RouteOptions}
   * @returns Route interface {@link RouteInterface}.
   * @example const route = new Route(options);
   */
  new (options: RouteOptions): RouteInterface;
}

/** Common properties to all types of route interfaces */
export interface RouteBaseInterface {
  /** Route id */
  get id(): RouteId;

  /** Id of the route variant definition from which the route was created */
  get variantId(): MocksServer.VariantDefinitionId;

  /** Id of the route definition from which the route was created */
  get routeId(): RouteDefinitionId;

  /** HTTP method */
  get methods(): RequestHandlerHttpMethod[];

  /** The route handles all HTTP methods */
  get allMethods(): boolean;

  /** Route path */
  get path(): string;

  /**
   * Route url
   * @deprecated Use path instead
   */
  get url(): string;

  /** Namespaced logger, using route id as namespace id */
  get logger(): LoggerInterface;

  /** Delay to apply to the response */
  get delay(): number | null;
}

/** Route interface */
export interface RouteInterface extends RouteBaseInterface {
  /** Route handler is disabled */
  get disabled(): boolean;

  /** Route handler */
  get handler(): VariantHandlerInterface | null;

  /** Variant handler type */
  get type(): MocksServer.VariantHandlerTypes | null;

  /** Response preview */
  get preview(): VariantHandlerResponsePreview | null;

  /**
   * Returns route representation in a plain object
   * @example route.toPlainObject();
   */
  toPlainObject(): RoutePlainObject;
}

/** Route interface enabled */
export interface RouteInterfaceEnabled extends RouteBaseInterface {
  /** Route handler is disabled */
  get disabled(): false;

  /** Route handler */
  get handler(): VariantHandlerInterface;

  /** Variant handler type */
  get type(): MocksServer.VariantHandlerTypes;

  /** Response preview */
  get preview(): VariantHandlerResponsePreview | null;

  /**
   * Returns route representation in a plain object
   * @example route.toPlainObject();
   */
  toPlainObject(): RoutePlainObject;
}

/** Route interface enabled */
export interface RouteInterfaceDisabled extends RouteBaseInterface {
  /** Route handler is disabled */
  get disabled(): true;

  /** Route handler */
  get handler(): null;

  /** Variant handler type */
  get type(): null;

  /** Response preview */
  get preview(): null;

  /**
   * Returns route representation in a plain object
   * @example route.toPlainObject();
   */
  toPlainObject(): RoutePlainObject;
}
