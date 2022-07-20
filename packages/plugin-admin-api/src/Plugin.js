/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const {
  DEFAULT_BASE_PATH,
  SETTINGS,
  MOCKS,
  ABOUT,
  ROUTES,
  ROUTES_VARIANTS,
  MOCK_CUSTOM_ROUTES_VARIANTS,
  ALERTS,
} = require("@mocks-server/admin-api-paths");

const About = require("./About");
const Settings = require("./Settings");
const Alerts = require("./Alerts");
const CustomRoutesVariants = require("./CustomRoutesVariants");
const Root = require("./Root");
const AdminServer = require("./server/Server");
const Swagger = require("./swagger/Swagger");
const { enableCors, addLegacyApiAlert } = require("./server/middlewares");
const Api = require("./Api");

const { PLUGIN_NAME } = require("./support/constants");
const { readCollectionAndModelRouter } = require("./support/routers");
const { version } = require("../package.json");

const OPTION = {
  name: "path",
  description: `Legacy root path for admin routes`,
  type: "string",
  default: DEFAULT_BASE_PATH,
};

const OPTION_ALERT_ID = "path-option";
const OPTION_ALERT_MESSAGE =
  "Usage of 'adminApi.path' option is deprecated. Consider using the new REST API: https://www.mocks-server.org/docs/integrations/rest-api";

class Plugin {
  static get id() {
    return PLUGIN_NAME;
  }

  constructor({ config, logger, mock, server, alerts, version: coreVersion }) {
    this._server = server;
    this._logger = logger;
    this._config = config;
    this._coreVersion = coreVersion;
    this._alerts = alerts;

    this._adminServer = new AdminServer({
      alerts,
      logger: this._logger.namespace("server"),
      config,
      onChangeOptions: ({ host, port }) => {
        this._swagger.setOptions({
          version,
          host,
          port,
        });
      },
    });

    this._adminApiPathOption = this._config.addOption(OPTION);

    // LEGACY APIS
    this._settingsApiLegacy = new Settings({
      logger: this._logger.namespace("settingsLegacy"),
      config,
    });
    this._alertsApiLegacy = new Alerts({
      alerts,
      logger: this._logger.namespace("alertsLegacy"),
      parseAlert: (alert) => {
        return {
          id: alert.context,
          context: alert.context,
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
    this._aboutApiLegacy = new About({
      logger: this._logger.namespace("aboutLegacy"),
      getResponse: () => ({
        version,
      }),
    });
    this._customRoutesVariantsApiLegacy = new CustomRoutesVariants({
      logger: this._logger.namespace("customRouteVariantsLegacy"),
      getRouteVariants: () => mock.plainRoutesVariants,
      mock,
    });

    this._mocksApiLegacy = readCollectionAndModelRouter({
      collectionName: "legacy mocks",
      modelName: "legacy mock",
      getItems: () => mock.plainMocks,
      logger: this._logger.namespace("mocksLegacy"),
    });

    this._routesApiLegacy = readCollectionAndModelRouter({
      collectionName: "legacy routes",
      modelName: "legacy route",
      getItems: () => mock.plainRoutes,
      logger: this._logger.namespace("routesLegacy"),
    });

    this._routesVariantsApiLegacy = readCollectionAndModelRouter({
      collectionName: "legacy routes variants",
      modelName: "legacy route variant",
      getItems: () => mock.plainRoutesVariants,
      logger: this._logger.namespace("routeVariantsLegacy"),
    });

    // APIS
    this._root = new Root({
      redirectUrl: "/docs",
    });
    this._swagger = new Swagger({ config });

    this._apiRouter = new Api({
      logger: this._logger.namespace("api"),
      config,
      mock,
      alerts,
      coreVersion,
    });

    this._adminServer.addRouter({ path: "/api", router: this._apiRouter.router });
    this._adminServer.addRouter({ path: "/docs", router: this._swagger.router });
    this._adminServer.addRouter({ path: "/", router: this._root.router });

    this._onChangeAdminApiPath = this._onChangeAdminApiPath.bind(this);
  }

  init() {
    this._initRouter();
    this._adminServer.init();
    if (this._adminApiPathOption.hasBeenSet) {
      this._alerts.set(OPTION_ALERT_ID, OPTION_ALERT_MESSAGE);
    }
  }

  start() {
    this._stopListeningOnChangeAdminApiPath = this._adminApiPathOption.onChange(
      this._onChangeAdminApiPath
    );
    this._addRouter();
    return this._adminServer.start();
  }

  stop() {
    this._stopListeningOnChangeAdminApiPath();
    this._removeRouter();
    return this._adminServer.stop();
  }

  _initRouter() {
    this._router = express.Router();
    this._router.use(enableCors());
    this._router.use(addLegacyApiAlert(this._alerts));
    // LEGACY APIs
    this._router.use(ABOUT, this._aboutApiLegacy.router);
    this._router.use(SETTINGS, this._settingsApiLegacy.router); // TODO, add config route. deprecate settings
    this._router.use(ALERTS, this._alertsApiLegacy.router);

    this._router.use(MOCKS, this._mocksApiLegacy);
    this._router.use(ROUTES, this._routesApiLegacy);
    this._router.use(ROUTES_VARIANTS, this._routesVariantsApiLegacy);
    this._router.use(MOCK_CUSTOM_ROUTES_VARIANTS, this._customRoutesVariantsApiLegacy.router);
  }

  _addRouter() {
    this._removeRouter();
    this._routersPath = this._adminApiPathOption.value;
    this._server.addRouter(this._routersPath, this._router);
  }

  _removeRouter() {
    if (this._routersPath) {
      this._server.removeRouter(this._routersPath, this._router);
      this._routersPath = null;
    }
  }

  _onChangeAdminApiPath() {
    this._alerts.set(OPTION_ALERT_ID, OPTION_ALERT_MESSAGE);
    this._addRouter();
  }
}

module.exports = Plugin;
