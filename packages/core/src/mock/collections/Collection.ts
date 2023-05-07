/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";
import express from "express";

import type { AlertsInterface } from "../../alerts/Alerts.types";
import type { EventListener } from "../../common/Events.types";
import type {
  HTTPMethod,
  NextFunction,
  Request,
  RequestHandler,
  RequestHandlerHttpMethod,
  Response,
  Router,
} from "../../server/Server.types";
import { handlerIsRouter } from "../../variant-handlers/helpers";
import { routeIsEnabled } from "../routes/Route";
import type {
  RouteInterface,
  RouteDefinitionHTTPValidMethod,
  HTTPMethodId,
  RouteId,
} from "../routes/Route.types";
import type { RoutesInterface } from "../routes/Routes.types";
import { HTTP_METHODS, ALL_HTTP_METHODS_ALIAS } from "../validations";

import type {
  CollectionConstructor,
  CollectionInterface,
  CollectionOptions,
  CollectionId,
  ResetRoutesOptions,
} from "./Collection.types";
import { addRoutesToCollectionRoutes } from "./Helpers";

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
  private _routesManager: RoutesInterface;
  private _routes: RouteInterface[];
  private _originalRoutes: RouteInterface[];
  private _hasCustomRoutes = false;
  private _router: Router;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _alertsUseRoute: AlertsInterface;
  private _onChange: EventListener;

  constructor({ id, routes, routesManager, logger, alerts, onChange }: CollectionOptions) {
    this._routesManager = routesManager;
    this._id = id;
    this._originalRoutes = [...routes];
    this._routes = [...routes];
    this._logger = logger;
    this._alerts = alerts;
    this._alerts.clean();
    this._alertsUseRoute = this._alerts.collection("useRoute");
    this._onChange = onChange;
    this._initRouter();
  }

  private _initRouter() {
    this._router = express.Router();
    this._routes.forEach((route) => {
      const logAndApplyDelay: RequestHandler = (
        req: Request,
        _res: Response,
        next: NextFunction
      ) => {
        route.logger.info(`Request ${req.method} => ${req.url} | req: ${req.id}`);
        const delay = route.delay !== null ? route.delay : this._routesManager.delay;
        if (delay > 0) {
          this._routesManager.logger.verbose(
            `Applying delay of ${delay}ms to route variant '${this._id}'`
          );
          setTimeout(() => {
            next();
          }, delay);
        } else {
          next();
        }
      };
      if (routeIsEnabled(route)) {
        if (handlerIsRouter(route.handler)) {
          this._router.use(route.path, logAndApplyDelay);
          this._router.use(route.path, route.handler.router.bind(route.handler));
        } else {
          const middleware = route.handler.middleware.bind(route.handler);
          const methods = getRouteMethods(route);
          methods.forEach((method) => {
            this._router[method](route.path, logAndApplyDelay);
            this._router[method](route.path, middleware);
          });
        }
      }
    });
  }

  public get routes(): RouteInterface[] {
    return [...this._routes];
  }

  public get id(): CollectionId {
    return this._id;
  }

  public get router(): Router {
    return this._router;
  }

  public get hasCustomRoutes(): boolean {
    return this._hasCustomRoutes;
  }

  public useRoute(routeId: RouteId): void {
    this._logger.info(`Adding route '${routeId}'`);
    const routeToAdd = this._routesManager.findById(routeId);
    if (routeToAdd) {
      this._routes = addRoutesToCollectionRoutes(this._routes, [routeToAdd]);
      this._initRouter();
      this._onChange();
      this._hasCustomRoutes = true;
    } else {
      this._alertsUseRoute.set(routeId, `Route with id '${routeId}' not found`);
    }
  }

  public resetRoutes({ silent }: ResetRoutesOptions = {}): void {
    this._routes = [...this._originalRoutes];
    this._alertsUseRoute.clean();
    this._hasCustomRoutes = false;
    this._initRouter();
    if (!silent) {
      this._onChange();
    }
  }
};
