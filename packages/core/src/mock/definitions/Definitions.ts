/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { CollectionDefinitions } from "./CollectionDefinitions";
import type {
  CollectionDefinition,
  CollectionDefinitionsInterface,
} from "./CollectionDefinitions.types";
import { DefinitionLoadersManager } from "./DefinitionLoadersManager";
import type { DefinitionLoadersManagerInterface } from "./DefinitionLoadersManager.types";
import type {
  DefinitionsInterface,
  DefinitionsConstructor,
  DefinitionsOptions,
  DefinitionsLoaders,
} from "./Definitions.types";
import { RouteDefinitions } from "./RouteDefinitions";
import type { RouteDefinition, RouteDefinitionsInterface } from "./RouteDefinitions.types";

export const Definitions: DefinitionsConstructor = class Definitions
  implements DefinitionsInterface
{
  private _collectionDefinitionsManager: DefinitionLoadersManagerInterface<CollectionDefinition>;
  private _routeDefinitionsManager: DefinitionLoadersManagerInterface<RouteDefinition>;
  private _collectionDefinitions: CollectionDefinitionsInterface;
  private _routeDefinitions: RouteDefinitionsInterface;
  private _loadedCollections = false;
  private _loadedRoutes = false;
  private _onLoadCallback: DefinitionsOptions["onLoad"];

  constructor({ onLoad }: DefinitionsOptions) {
    this._collectionDefinitions = new CollectionDefinitions();
    this._routeDefinitions = new RouteDefinitions();
    this._onLoadCallback = onLoad;

    this._collectionDefinitionsManager = new DefinitionLoadersManager({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._collectionDefinitions.set(this._collectionDefinitionsManager.definitions);
        this._loadedCollections = true;
        if (this._loadedRoutes) {
          this._onLoad();
        }
      },
    });

    this._routeDefinitionsManager = new DefinitionLoadersManager({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._loadedRoutes = true;
        this._routeDefinitions.set(this._routeDefinitionsManager.definitions);
        if (this._loadedCollections) {
          this._onLoad();
        }
      },
    });
  }

  private _onLoad(): void {
    this._onLoadCallback();
  }

  public get collections(): CollectionDefinitionsInterface {
    return this._collectionDefinitions;
  }

  public get routes(): RouteDefinitionsInterface {
    return this._routeDefinitions;
  }

  public createLoaders(): DefinitionsLoaders {
    return {
      loadRoutes: this._routeDefinitionsManager.createLoader(),
      loadCollections: this._collectionDefinitionsManager.createLoader(),
    };
  }
};
