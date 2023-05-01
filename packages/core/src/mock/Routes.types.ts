/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";

import type { EventListener } from "../common/Events.types";

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

/** Route definition */
export interface RouteDefinition {
  /** Route id */
  id: string;
  /** Route variants */
  variants: MocksServer.VariantDefinition[];
}

/** Options for creating a Routes interface */
export interface RoutesOptions {
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
  new (options: RoutesOptions): RoutesInterface;
}

/** Interface for managing Mocks Server routes. Currently it does not have almost responsibility, but this has to be refactored. TODO: Migrate routes responsibility to this interface */
export interface RoutesInterface {
  /** Get current routes in plain format */
  get plain(): RouteDefinition[];

  /** Get current route variants in plain format */
  get plainVariants(): MocksServer.VariantDefinition[];

  /** Get value of delay configuration */
  get delay(): number;
}
