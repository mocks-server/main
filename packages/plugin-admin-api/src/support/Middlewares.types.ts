/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";

import type { ApiEntityItem } from "../common/Common.types";

/** Options for creating an API middleware for an API collection */
export interface CollectionMiddlewareOptions<Item extends ApiEntityItem> {
  /** collection name */
  name: string;
  /** Function for getting collection items */
  getItems: () => Item[];
  /** Mocks server logger */
  logger: ScopedCoreInterface["logger"];
}

/** Options for creating an API middleware for an API model */
export interface ModelMiddlewareOptions<
  Item extends ApiEntityItem,
  ParsedItem extends ApiEntityItem
> {
  /** model name */
  name: string;
  /** Function for getting collection items */
  getItems: () => Item[];
  /** Function for transforming model before sending it */
  parseItem?: (item: Item) => ParsedItem;
  /** Mocks server logger */
  logger: ScopedCoreInterface["logger"];
}
