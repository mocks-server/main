/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject } from "../../common/types";
import type { HTTPMethod } from "../../server/types";

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

export type VariantDefinition = MocksServer.VariantDefinition;
export type VariantDefinitionTypes = MocksServer.VariantHandlerTypes;
export type VariantHandlerTypes = MocksServer.VariantHandlerTypes;

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

/** Route definition id */
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

/** Normalized variant definition */
export interface VariantDefinitionNormalized {
  /** Route variant id */
  id: MocksServer.VariantDefinitionId;
  /** Variant is disabled */
  disabled: boolean;
  /** Delay to apply to the response */
  delay?: number;
  /** Variant handler type */
  type: MocksServer.VariantHandlerTypes;
  /** Variant handler options */
  options: UnknownObject; // TODO, define options depending on type. It would require to define normalized types in variant handlers, and probably a mechanism to convert from non normalized to normalized, as well as a schema (to be able to declare the openApi schema, for example)
}

/** Normalized route definition */
export interface RouteDefinitionNormalized {
  /** Route id */
  id: RouteDefinitionId;

  /** HTTP method that this route will handle */
  method: RouteDefinitionHTTPMethod;

  /** Route path */
  path: string;

  /** Delay to apply to the response */
  delay?: number | null;

  /** Route variants */
  variants: VariantDefinitionNormalized[];
}

/** Creates a route definitions interface */
export interface RouteDefinitionsConstructor {
  /** Returns a Route definitions interface
   * @param options - Options to create the route definitions interface {@link RouteDefinitionsOptions}.
   * @returns Route definitions interface {@link RouteDefinitionsInterface}.
   * @example const routeDefinitions = new RouteDefinitions();
   */
  new (): RouteDefinitionsInterface;
}

/** Expose method for getting route definitions */
export interface RouteDefinitionsInterface {
  /** Return route definitions */
  get(): RouteDefinition[];

  /** Set route definitions
   * @param routeDefinitions - Route definitions {@link RouteDefinition[]}.
   * @example routeDefinitions.set(routeDefinitionsLoaded);
   */
  set(routeDefinitions: RouteDefinition[]): void;

  /** Return a route definition having the provided id
   * @param id - Route definition id {@link RouteDefinitionId}.
   * @returns Route definition {@link RouteDefinition}.
   * @example const routeDefinition = routeDefinitions.findById("foo");
   */
  findById(id: RouteDefinitionId): RouteDefinition | undefined;

  /** Return normalized route definitions */
  getNormalized(): RouteDefinitionNormalized[];

  /** Return a normalized route definition having the provided id
   * @param id - Route definition id {@link RouteDefinitionId}.
   * @returns Route definition normalized {@link RouteDefinitionNormalized}.
   * @example const routeDefinition = routeDefinitions.findByIdAndNormalize("foo");
   */
  findByIdAndNormalize(id: RouteDefinitionId): RouteDefinitionNormalized | undefined;
}
