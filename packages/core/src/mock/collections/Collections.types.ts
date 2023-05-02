/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { EventListener } from "../../common/Events.types";

import type { CollectionId, CollectionDefinition } from "./Collection.types";

/** Options for creating a Collections interface */
export interface CollectionsOptions {
  /** Namespaced Mocks Server logger */
  logger: LoggerInterface;
  /** Namespaced Mocks Server config */
  config: NamespaceInterface;
  /** Callback to execute when selected collection changes */
  onChangeSelected: EventListener;
  /** Method to get array of collection ids */
  getIds: () => CollectionId[];
  /** Method to get array of collections in plain format */
  getPlainCollections: () => CollectionDefinition[];
  /** Method to get currently selected collection id */
  getSelected: () => CollectionId;
}

/** Creates a Collections interface */
export interface CollectionsConstructor {
  /** Unique identifier of Collections class. Used for logging and alerts namespaces */
  get id(): string;

  /** Returns a Collections interface
   * @param options - Options to create the collections interface {@link CollectionsOptions}.
   * @returns Collections interface {@link CollectionsInterface}.
   * @example const collections = new Collections({ logger, config, onChangeSelected, getIds, getPlainCollections, getSelected });
   */
  new (options: CollectionsOptions): CollectionsInterface;
}

export interface SelectCollectionOptionsNoPromise {
  check?: false;
}

export interface SelectCollectionOptionsPromise {
  check: true;
}

/** Method to select current collection */
export interface SelectCollection {
  (id: CollectionId, options: SelectCollectionOptionsNoPromise): void;
  (id: CollectionId, options: SelectCollectionOptionsPromise): Promise<void>;
}

/** Interface for managing Mocks Server collections. Currently it does not have almost responsibility, but this has to be refactored. TODO: Migrate routes responsibility to this interface */
export interface CollectionsInterface {
  /** Return id of currently selected collection */
  get selected(): CollectionId;

  /** Return array of collection ids */
  get ids(): CollectionId[];

  /** Return array of collections in plain format */
  get plain(): CollectionDefinition[];

  /** Set current collection */
  select: SelectCollection;
}
