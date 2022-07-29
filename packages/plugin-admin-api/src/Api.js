/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const {
  ABOUT,
  CONFIG,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
} = require("@mocks-server/admin-api-paths");

const About = require("./About");
const Settings = require("./Settings");
const Alerts = require("./Alerts");
const CustomRoutesVariants = require("./CustomRoutesVariants");

const { readCollectionAndModelRouter } = require("./support/routers");
const { version } = require("../package.json");

class Api {
  constructor({ logger, config, mock, alerts, coreVersion }) {
    this._logger = logger;
    this._router = express.Router();
    this._coreVersion = coreVersion;

    this._configApi = new Settings({
      logger: this._logger.namespace("config"),
      config,
    });
    this._alertsApi = new Alerts({
      alerts,
      logger: this._logger.namespace("alerts"),
      parseAlert: (alert) => {
        return {
          id: alert.id,
          message: alert.message,
          error: alert.error
            ? {
                name: alert.error.name,
                message: alert.error.message,
                stack: alert.error.stack,
              }
            : null,
        };
      },
    });
    this._aboutApi = new About({
      logger: this._logger.namespace("about"),
      getResponse: () => ({
        versions: {
          adminApi: version,
          core: this._coreVersion,
        },
      }),
    });
    this._customRoutesVariantsApi = new CustomRoutesVariants({
      logger: this._logger.namespace("customRouteVariants"),
      getRouteVariants: () => mock.routes.plainVariants,
      mock,
    });

    this._collectionsApi = readCollectionAndModelRouter({
      collectionName: "collections",
      modelName: "collection",
      getItems: () => mock.collections.plain,
      logger: this._logger.namespace("collections"),
    });

    const parseRoute = (route) => {
      return route;
    };

    this._routesApi = readCollectionAndModelRouter({
      collectionName: "routes",
      modelName: "route",
      getItems: () => mock.routes.plain.map(parseRoute),
      parseItem: parseRoute,
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

  get router() {
    return this._router;
  }
}

module.exports = Api;
