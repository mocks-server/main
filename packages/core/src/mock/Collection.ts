/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";
import express from "express";

import type {
  HTTPMethod,
  NextFunction,
  Request,
  RequestHandler,
  RequestHandlerHttpMethod,
  Response,
  Router,
} from "../server/Server.types";

import type {
  CollectionConstructor,
  CollectionInterface,
  CollectionOptions,
  CollectionId,
} from "./Collection.types";
import { routeHandlerIsRouter } from "./Route";
import type { RouteInterface, RouteDefinitionHTTPValidMethod, HTTPMethodId } from "./Route.types";
import { HTTP_METHODS, ALL_HTTP_METHODS_ALIAS } from "./validations";

function getExpressHttpMethod(method: RouteDefinitionHTTPValidMethod): HTTPMethod {
  return HTTP_METHODS[method.toUpperCase() as HTTPMethodId] as HTTPMethod; // TODO, remove as when HTTP_METHODS is typed
}

function getRouteMethods(routeVariant: RouteInterface): RequestHandlerHttpMethod[] {
  const method = routeVariant.method;
  if (!method || method === ALL_HTTP_METHODS_ALIAS) {
    return ["all"];
  }
  if (Array.isArray(method)) {
    return method.map(getExpressHttpMethod);
  }
  return [getExpressHttpMethod(method)];
}

export const Collection: CollectionConstructor = class Collection implements CollectionInterface {
  private _id: CollectionId;
  private _logger: LoggerInterface;
  private _routeVariants: RouteInterface[]; // TODO, route variants type
  private _getDelay: () => number; // TODO, relation with delay Type when config accepts types
  private _router: Router;

  constructor({ id, routeVariants, getDelay, logger }: CollectionOptions) {
    this._logger = logger;
    this._id = id;
    this._routeVariants = routeVariants;
    this._getDelay = getDelay;
    this._initRouter();
  }

  private _initRouter() {
    this._router = express.Router();
    this._routeVariants.forEach((routeVariant) => {
      const logAndApplyDelay: RequestHandler = (
        req: Request,
        _res: Response,
        next: NextFunction
      ) => {
        routeVariant.logger.info(`Request ${req.method} => ${req.url} | req: ${req.id}`);
        const delay = routeVariant.delay !== null ? routeVariant.delay : this._getDelay();
        if (delay > 0) {
          this._logger.verbose(`Applying delay of ${delay}ms to route variant '${this._id}'`);
          setTimeout(() => {
            next();
          }, delay);
        } else {
          next();
        }
      };
      if (!routeVariant.disabled) {
        if (routeHandlerIsRouter(routeVariant)) {
          this._router.use(routeVariant.url, logAndApplyDelay);
          this._router.use(routeVariant.url, routeVariant.router.bind(routeVariant));
        } else {
          const methods = getRouteMethods(routeVariant);
          methods.forEach((method) => {
            this._router[method](routeVariant.url, logAndApplyDelay);
            this._router[method](routeVariant.url, routeVariant.middleware.bind(routeVariant));
          });
        }
      }
    });
  }

  // TODO, rename to routeHandlers
  public get routeVariants(): RouteInterface[] {
    return this._routeVariants;
  }

  public get id(): CollectionId {
    return this._id;
  }

  public get router(): Router {
    return this._router;
  }
};
