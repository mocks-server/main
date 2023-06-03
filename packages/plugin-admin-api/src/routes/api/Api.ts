/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import {
  ABOUT,
  CONFIG,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
} from "@mocks-server/admin-api-paths";
import type { ScopedCoreInterface } from "@mocks-server/core";
import { Router } from "express";

import { readCollectionAndModelRouter } from "../../support/Routers";

import { About } from "./About";
import type { AboutInterface } from "./About.types";
import { Alerts } from "./Alerts";
import type { AlertsInterface } from "./Alerts.types";
import type { ApiConstructor, ApiInterface, ApiOptions } from "./Api.types";
import { Config } from "./Config";
import type { ConfigInterface } from "./Config.types";
import { CustomRouteVariants } from "./CustomRouteVariants";
import type { CustomRouteVariantsInterface } from "./CustomRouteVariants.types";

export const Api: ApiConstructor = class Api implements ApiInterface {
  private _logger: ScopedCoreInterface["logger"];
  private _router: Router;
  private _coreVersion: string;
  private _configApi: ConfigInterface;
  private _alertsApi: AlertsInterface;
  private _aboutApi: AboutInterface;
  private _customRoutesVariantsApi: CustomRouteVariantsInterface;
  private _collectionsApi: Router;
  private _routesApi: Router;
  private _routeVariantsApi: Router;

  constructor({ logger, config, mock, alerts, coreVersion }: ApiOptions) {
    this._logger = logger;
    this._router = Router();
    this._coreVersion = coreVersion;

    this._configApi = new Config({
      logger: this._logger.namespace("config"),
      config,
    });
    this._alertsApi = new Alerts({
      alerts,
      logger: this._logger.namespace("alerts"),
    });
    this._aboutApi = new About({
      coreVersion: this._coreVersion,
      logger: this._logger.namespace("about"),
    });
    this._customRoutesVariantsApi = new CustomRouteVariants({
      logger: this._logger.namespace("customRouteVariants"),
      mock,
    });

    this._collectionsApi = readCollectionAndModelRouter({
      collectionName: "collections",
      modelName: "collection",
      getItems: () => mock.collections.plain,
      logger: this._logger.namespace("collections"),
    });

    this._routesApi = readCollectionAndModelRouter({
      collectionName: "routes",
      modelName: "route",
      getItems: () => mock.routes.plain,
      logger: this._logger.namespace("routes"),
    });

    this._routeVariantsApi = readCollectionAndModelRouter({
      collectionName: "route variants",
      modelName: "route variant",
      getItems: () => mock.routes.plainVariants,
      logger: this._logger.namespace("routeVariants"),
    });

    this._router.use(ABOUT, this._aboutApi.router);
    this._router.use(CONFIG, this._configApi.router);
    this._router.use(ALERTS, this._alertsApi.router);
    this._router.use(COLLECTIONS, this._collectionsApi);
    this._router.use(ROUTES, this._routesApi);
    this._router.use(VARIANTS, this._routeVariantsApi);
    this._router.use(CUSTOM_ROUTE_VARIANTS, this._customRoutesVariantsApi.router);
  }

  public get router() {
    return this._router;
  }
};
