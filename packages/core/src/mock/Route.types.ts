/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { HTTPMethod } from "../server/Server.types";
import type {
  VariantHandlerInterfaceWithMiddleware,
  VariantHandlerInterfaceWithRouter,
} from "../variant-handlers/VariantHandlers.types";

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    //eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface VariantHandlerOptionsByType {}

    /** Common properties to all types of route variants */
    interface VariantDefinitionCommon {
      /** Route variant id */
      id: string;
    }

    /** Different variant properties by variant handler id */
    type VariantHandlersDefinitions = {
      [K in keyof VariantHandlerOptionsByType]: {
        type: K;
        options: VariantHandlerOptionsByType[K];
      };
    };

    /** Route variant definition */
    type VariantDefinition = VariantHandlersDefinitions[keyof VariantHandlersDefinitions] &
      VariantDefinitionCommon;
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

/** Route definition */
export interface RouteDefinition {
  /** Route id */
  id: string;

  /** HTTP method that this route will handle */
  method: RouteDefinitionHTTPMethod;

  /** Route variants */
  variants: MocksServer.VariantDefinition[];
}

/** Common properties to all types of route handlers */
export interface RouteBaseInterface {
  /** Route id */
  get id(): string;

  /** HTTP method */
  get method(): RouteDefinitionHTTPMethod; // TODO, use accepted methods type

  /** TODO, deprecate. Use path instead */
  get url(): string;

  /** Route path */
  get path(): string;

  /** Namespaced logger, using route id as namespace id */
  get logger(): LoggerInterface;

  /** Delay to apply to the response */
  get delay(): number | null;

  /** Route handler is disabled */
  get disabled(): boolean;
}

/** Route handler created from a route variant with middleware based handler */
export type RouteInterfaceWithMiddleware = RouteBaseInterface &
  VariantHandlerInterfaceWithMiddleware;

/** Route handler created from a route variant with router based handler */
export type RouteInterfaceWithRouter = RouteBaseInterface & VariantHandlerInterfaceWithRouter;

/** Route handler. The result of mixin the route with the chosen variant. This is the handler passed to collections */
export type RouteInterface = RouteInterfaceWithMiddleware | RouteInterfaceWithRouter;
