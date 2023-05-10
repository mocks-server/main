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
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "../../server/Server.types";
import { handlerIsRouter } from "../../variant-handlers/helpers";
import type { CollectionId } from "../definitions/CollectionDefinitions.types";
import { routeIsEnabled } from "../routes/Route";
import type { RouteInterface, RouteId } from "../routes/Route.types";
import type { RoutesInterface } from "../routes/Routes.types";

import type {
  CollectionConstructor,
  CollectionInterface,
  CollectionOptions,
  CollectionPlainObject,
  ResetRoutesOptions,
} from "./Collection.types";
import { addRoutesToCollectionRoutes } from "./Helpers";

export const Collection: CollectionConstructor = class Collection implements CollectionInterface {
  private _id: CollectionId;
  private _routesManager: RoutesInterface;
  private _routes: RouteInterface[];
  private _originalRoutes: RouteInterface[];
  private _router: Router;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _alertsUseRoute: AlertsInterface;
  private _onChange: EventListener;
  private _from: CollectionId | null = null;
  private _customRoutes: RouteInterface[] = [];
  private _specificRouteIds: RouteId[] = [];
  private _inheritedRouteIds: RouteId[] = [];

  constructor({
    id,
    from,
    routes,
    specificRouteIds,
    routesManager,
    logger,
    alerts,
    onChange,
  }: CollectionOptions) {
    this._routesManager = routesManager;
    this._id = id;
    this._from = from || null;
    this._originalRoutes = [...routes];
    this._routes = [...routes];
    this._specificRouteIds = [...specificRouteIds];
    this._inheritedRouteIds = this._routes
      .map((route) => route.id)
      .filter((routeId) => {
        return !this._specificRouteIds.includes(routeId);
      });
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
          if (route.allMethods) {
            this._router.all(route.path, logAndApplyDelay);
            this._router.all(route.path, middleware);
          } else {
            route.methods.forEach((method) => {
              this._router[method](route.path, logAndApplyDelay);
              this._router[method](route.path, middleware);
            });
          }
        }
      }
    });
  }

  public get id(): CollectionId {
    return this._id;
  }

  public get from(): CollectionId | null {
    return this._from;
  }

  public get routes(): RouteInterface[] {
    return [...this._routes];
  }

  public get customRoutes(): RouteInterface[] {
    return [...this._customRoutes];
  }

  private get _customRouteIds(): RouteId[] {
    return this._customRoutes.map((route) => route.id);
  }

  public get customRouteIds(): RouteId[] {
    return this._customRouteIds;
  }

  public get router(): Router {
    return this._router;
  }

  public useRoute(routeId: RouteId): void {
    this._logger.info(`Adding route '${routeId}'`);
    const routeToAdd = this._routesManager.findById(routeId);
    if (routeToAdd) {
      this._routes = addRoutesToCollectionRoutes(this._routes, [routeToAdd]);
      this._customRoutes.push(routeToAdd);
      this._initRouter();
      this._onChange();
    } else {
      this._alertsUseRoute.set(routeId, `Route with id '${routeId}' not found`);
    }
  }

  public resetRoutes({ silent }: ResetRoutesOptions = {}): void {
    this._routes = [...this._originalRoutes];
    this._customRoutes = [];
    this._alertsUseRoute.clean();
    this._initRouter();
    if (!silent) {
      this._onChange();
    }
  }

  public toPlainObject(): CollectionPlainObject {
    return {
      id: this._id,
      routes: this._routes.map((route) => route.id),
      from: this._from,
      customRoutes: this._customRouteIds,
      specificRoutes: [...this._specificRouteIds],
      inheritedRoutes: [...this._inheritedRouteIds],
    };
  }
};
