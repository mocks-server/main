/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { HTTPMethod } from "../../server/Server.types";
import type {
  VariantHandlerInterface,
  VariantHandlerResponsePreview,
} from "../../variant-handlers/VariantHandlers.types";

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    //eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface VariantHandlerOptionsByType {}

    interface VariantHandlerBaseOptions {
      /** Route method */
      method: RouteDefinitionHTTPMethod;
      /** Route path */
      url: string; // TODO, deprecate. Use path instead
    }

    type VariantDefinitionId = string;

    /** Common properties to all types of route variants */
    interface VariantDefinitionCommon {
      /** Route variant id */
      id: VariantDefinitionId;
      /** Variant is disabled */
      disabled?: boolean;
      /** Delay to apply to the response */
      delay?: number;
    }

    /** Different variant properties by variant handler id */
    type VariantHandlersDefinitions = {
      [K in keyof VariantHandlerOptionsByType]: {
        type: K;
        options: VariantHandlerOptionsByType[K];
      };
    };

    type VariantHandlerTypes = keyof VariantHandlerOptionsByType;

    /** Route variant definition */
    type VariantDefinition = VariantHandlersDefinitions[keyof VariantHandlersDefinitions] &
      VariantDefinitionCommon;

    type VariantHandlerTypeOptions =
      VariantHandlerOptionsByType[keyof VariantHandlerOptionsByType];

    type VariantHandlerOptions = VariantHandlerBaseOptions &
      VariantHandlerOptionsByType[keyof VariantHandlerOptionsByType];
  }
}

/** Valid express http methods in upperCase */
export type HTTPMethodId = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

/** Alias for all methods */
export type AllHTTPMethodsAlias = "*";

/** Valid single values for route method */
export type RouteDefinitionHTTPValidMethod = HTTPMethod | HTTPMethodId | AllHTTPMethodsAlias;

/** Valid value for route method */
export type RouteDefinitionHTTPMethod =
  | RouteDefinitionHTTPValidMethod
  | RouteDefinitionHTTPValidMethod[];

export type RouteDefinitionId = string;

/** Route definition */
export interface RouteDefinition {
  /** Route id */
  id: RouteDefinitionId;

  /** HTTP method that this route will handle */
  method: RouteDefinitionHTTPMethod;

  /** TODO, deprecate. Use path instead */
  url: string;

  /** Route path */
  path?: string;

  /** Delay to apply to the response */
  delay?: number | null;

  /** Route variants */
  variants: MocksServer.VariantDefinition[];
}

export type RouteId = `${RouteDefinitionId}:${MocksServer.VariantDefinitionId}`;

/** Options for creating a new Route */
export interface RouteOptions {
  /** Route id */
  id: RouteId;
  /** Route delay */
  delay?: number | null;
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
  get method(): RouteDefinitionHTTPMethod; // TODO, use accepted methods type

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
  get delay(): undefined | number | null;
}

/** Route interface */
export interface RouteInterface extends RouteBaseInterface {
  /** Route handler is disabled */
  get disabled(): boolean;

  /** Route handler */
  get handler(): VariantHandlerInterface | undefined;

  /** Variant handler type */
  get type(): MocksServer.VariantHandlerTypes | undefined;

  /** Response preview */
  get preview(): VariantHandlerResponsePreview | undefined | null;
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
}

/** Route interface enabled */
export interface RouteInterfaceDisabled extends RouteBaseInterface {
  /** Route handler is disabled */
  get disabled(): true;

  /** Route handler */
  get handler(): undefined;

  /** Variant handler type */
  get type(): undefined;

  /** Response preview */
  get preview(): undefined;
}
