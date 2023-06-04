/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  CollectionDefinition,
  CollectionDefinitionNormalized,
  CollectionDefinitionsConstructor,
  CollectionDefinitionsInterface,
  CollectionId,
} from "./CollectionDefinitions.types";

export const CollectionDefinitions: CollectionDefinitionsConstructor = class CollectionDefinitions
  implements CollectionDefinitionsInterface
{
  private _collectionDefinitions: CollectionDefinition[];

  constructor() {
    this._collectionDefinitions = [];
  }

  public getNormalized(): CollectionDefinitionNormalized[] {
    return this._collectionDefinitions.map(this._normalizeCollection);
  }

  public findByIdAndNormalize(id: CollectionId): CollectionDefinitionNormalized | undefined {
    const collection = this.findById(id);
    if (collection) {
      return this._normalizeCollection(collection);
    }
  }

  public get(): CollectionDefinition[] {
    return this._collectionDefinitions;
  }

  public set(collectionDefinitions: CollectionDefinition[]): void {
    this._collectionDefinitions = collectionDefinitions;
  }

  public findById(id: CollectionId): CollectionDefinition | undefined {
    return this._collectionDefinitions.find(
      (collectionDefinition) => collectionDefinition.id === id
    );
  }

  private _normalizeCollection(
    collectionDefinition: CollectionDefinition
  ): CollectionDefinitionNormalized {
    return {
      ...collectionDefinition,
      from: collectionDefinition.from || null,
    };
  }
};
