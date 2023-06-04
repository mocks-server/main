/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject } from "../../common/types";

import { replaceNonSerializableValues } from "./Helpers";

import type {
  RouteDefinition,
  RouteDefinitionsConstructor,
  RouteDefinitionsInterface,
  RouteDefinitionId,
  RouteDefinitionNormalized,
  VariantDefinitionNormalized,
  VariantHandlerTypeOptions,
  VariantDefinition,
} from "./RouteDefinitions.types";

export const RouteDefinitions: RouteDefinitionsConstructor = class RouteDefinitions
  implements RouteDefinitionsInterface
{
  private _routeDefinitions: RouteDefinition[];

  constructor() {
    this._routeDefinitions = [];
  }

  public get(): RouteDefinition[] {
    return this._routeDefinitions;
  }

  public set(routeDefinitions: RouteDefinition[]): void {
    this._routeDefinitions = routeDefinitions;
  }

  public findById(id: RouteDefinitionId): RouteDefinition | undefined {
    return this._routeDefinitions.find((routeDefinition) => routeDefinition.id === id);
  }

  public getNormalized(): RouteDefinitionNormalized[] {
    return this._routeDefinitions.map(this._normalizeRoute);
  }

  public findByIdAndNormalize(id: RouteDefinitionId): RouteDefinitionNormalized | undefined {
    const routeDefinition = this.findById(id);
    if (routeDefinition) {
      return this._normalizeRoute(routeDefinition);
    }
  }

  private _normalizeVariantOptions(variantOptions: VariantHandlerTypeOptions) {
    const options = variantOptions as unknown;
    return replaceNonSerializableValues(options as UnknownObject);
  }

  private _normalizeVariant(variant: VariantDefinition): VariantDefinitionNormalized {
    return {
      id: variant.id,
      disabled: variant.disabled || false,
      delay: variant.delay,
      type: variant.type,
      options: this._normalizeVariantOptions(variant.options),
    };
  }

  private _normalizeVariants(variants: VariantDefinition[]): VariantDefinitionNormalized[] {
    return variants.map(this._normalizeVariant);
  }

  private _normalizeRoute(routeDefinition: RouteDefinition): RouteDefinitionNormalized {
    return {
      id: routeDefinition.id,
      method: routeDefinition.method,
      path: routeDefinition.path || routeDefinition.url,
      delay: routeDefinition.delay,
      variants: this._normalizeVariants(routeDefinition.variants),
    };
  }
};
