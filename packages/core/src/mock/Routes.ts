/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { OptionProperties, NamespaceInterface, OptionInterface } from "@mocks-server/config";

import type { RouteDefinition } from "./Route.types";
import type { RoutesConstructor, RoutesInterface, RoutesOptions } from "./Routes.types";

const OPTIONS: OptionProperties[] = [
  {
    description: "Global delay to apply to routes",
    name: "delay",
    type: "number",
    default: 0,
  },
];

// TODO, add to data model, migrate routes logic here

export const Routes: RoutesConstructor = class Routes implements RoutesInterface {
  private _config: NamespaceInterface;
  private _delayOption: OptionInterface;
  private _getPlainRoutes: RoutesOptions["getPlainRoutes"];
  private _getPlainVariants: RoutesOptions["getPlainVariants"];

  static get id(): string {
    return "routes";
  }

  constructor({ config, onChangeDelay, getPlainRoutes, getPlainVariants }: RoutesOptions) {
    this._config = config;

    this._getPlainRoutes = getPlainRoutes;
    this._getPlainVariants = getPlainVariants;

    [this._delayOption] = this._config.addOptions(OPTIONS);
    this._delayOption.onChange(onChangeDelay);
  }

  public get plain(): RouteDefinition[] {
    return this._getPlainRoutes();
  }

  public get plainVariants(): MocksServer.VariantDefinition[] {
    return this._getPlainVariants();
  }

  public get delay(): number {
    return this._delayOption.value;
  }
};
