/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { OptionProperties, NamespaceInterface, OptionInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import { resolveWhenConditionPass } from "../common/Helpers";

import type { CollectionId } from "./Collection.types";
import type {
  CollectionsConstructor,
  CollectionsInterface,
  CollectionsOptions,
  SelectCollectionOptionsNoPromise,
  SelectCollectionOptionsPromise,
} from "./Collections.types";

const OPTIONS: OptionProperties[] = [
  {
    description: "Selected collection",
    name: "selected",
    type: "string",
  },
];

// TODO, add to data model

export const Collections: CollectionsConstructor = class Collections
  implements CollectionsInterface
{
  private _logger: LoggerInterface;
  private _config: NamespaceInterface;
  private _getPlainCollections: CollectionsOptions["getPlainCollections"];
  private _getIds: CollectionsOptions["getIds"];
  private _getSelected: CollectionsOptions["getSelected"];
  private _selectedOption: OptionInterface;

  static get id() {
    return "collections";
  }

  constructor({
    logger,
    config,
    onChangeSelected,
    getIds,
    getPlainCollections,
    getSelected,
  }: CollectionsOptions) {
    this._logger = logger;
    this._config = config;
    this._getPlainCollections = getPlainCollections;
    this._getIds = getIds;
    this._getSelected = getSelected;

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(onChangeSelected);
  }

  public get selected() {
    return this._getSelected();
  }

  public get ids() {
    return this._getIds();
  }

  public get plain() {
    return this._getPlainCollections();
  }

  public select(collection: CollectionId, options: SelectCollectionOptionsPromise): Promise<void>;
  public select(collection: CollectionId, options: SelectCollectionOptionsNoPromise): void;
  public select(collection: CollectionId, { check = false } = {}) {
    this._selectedOption.value = collection;
    if (check === true) {
      return resolveWhenConditionPass(() => {
        return this.selected === collection;
      });
    }
  }
};
