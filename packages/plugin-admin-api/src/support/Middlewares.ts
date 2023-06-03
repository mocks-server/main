/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { notFound } from "@hapi/boom";
import type { NextFunction, RequestHandler, Response, Router } from "express";

import type { ApiEntityItem } from "../common/Common.types";
import type { RequestWithId } from "../server/Server.types";

import type { CollectionMiddlewareOptions, ModelMiddlewareOptions } from "./Middlewares.types";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function collectionMiddleware<Item extends ApiEntityItem>({
  name,
  getItems,
  logger,
}: CollectionMiddlewareOptions<Item>): RequestHandler {
  return function (req: RequestWithId, res: Response): void {
    logger.verbose(`Sending ${name} | ${req.id}`);
    res.status(200);
    res.send(getItems());
  };
}

function modelMiddleware<Item extends ApiEntityItem, ParsedItem extends ApiEntityItem>({
  name,
  getItems,
  parseItem,
  logger,
}: ModelMiddlewareOptions<Item, ParsedItem>): RequestHandler {
  const capitalizedName = capitalize(name);
  const returnItem = parseItem ? (item: Item) => parseItem(item) : (item: Item) => item;
  return function (req: RequestWithId, res: Response, next: NextFunction): void {
    const id = req.params.id;
    logger.verbose(`Sending ${name} ${id} | ${req.id}`);

    const foundItem = getItems().find((item) => item.id === id);
    if (foundItem) {
      res.status(200);
      res.send(returnItem(foundItem));
    } else {
      next(notFound(`${capitalizedName} with id "${id}" was not found`));
    }
  };
}

export function addCollectionMiddleware<Item extends ApiEntityItem>(
  router: Router,
  options: CollectionMiddlewareOptions<Item>
) {
  router.get("/", collectionMiddleware<Item>(options));
}

export function addModelMiddleware<Item extends ApiEntityItem, ParsedItem extends ApiEntityItem>(
  router: Router,
  options: ModelMiddlewareOptions<Item, ParsedItem>
) {
  router.get("/:id", modelMiddleware<Item, ParsedItem>(options));
}
