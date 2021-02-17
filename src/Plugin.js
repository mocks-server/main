/*
Copyright 2019 Javier Brea
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
  LEGACY,
} = require("@mocks-server/admin-api-paths");

const packageInfo = require("../package.json");
const DeprecatedApi = require("./deprecated/Api");

const About = require("./About");
const Settings = require("./Settings");
const Alerts = require("./Alerts");
const CustomRoutesVariants = require("./CustomRoutesVariants");

const { ADMIN_API_PATH_OPTION, PLUGIN_NAME } = require("./support/constants");
const { readCollectionAndModelRouter } = require("./support/routers");

class Plugin {
  constructor(core, { addAlert }) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = this._core.settings;

    this._legacyApi = new DeprecatedApi(core, { addAlert });
    this._settingsApi = new Settings(this._core);
    this._alertsApi = new Alerts(this._core);
    this._aboutApi = new About(this._core);
    this._customRoutesVariantsApi = new CustomRoutesVariants(this._core);

    this._mocksApi = readCollectionAndModelRouter({
      collectionName: "mocks",
      modelName: "mock",
      getItems: () => this._core.mocks.plainMocks,
      tracer: core.tracer,
    });

    this._routesApi = readCollectionAndModelRouter({
      collectionName: "routes",
      modelName: "route",
      getItems: () => this._core.mocks.plainRoutes,
      tracer: core.tracer,
    });

    this._routesVariantsApi = readCollectionAndModelRouter({
      collectionName: "routes variants",
      modelName: "route variant",
      getItems: () => this._core.mocks.plainRoutesVariants,
      tracer: core.tracer,
    });

    core.addSetting({
      name: ADMIN_API_PATH_OPTION,
      type: "string",
      description: `Api path for ${PLUGIN_NAME}`,
      default: DEFAULT_BASE_PATH,
    });

    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  get displayName() {
    return packageInfo.name;
  }

  init() {
    this._legacyApi.init();
    this._initRouter();
  }

  start() {
    this._stopListeningOnChangeSettings = this._core.onChangeSettings(this._onChangeSettings);
    this._addRouter();
  }

  stop() {
    this._stopListeningOnChangeSettings();
    this._removeRouter();
  }

  _initRouter() {
    this._router = express.Router();
    this._router.use(ABOUT, this._aboutApi.router);
    this._router.use(SETTINGS, this._settingsApi.router);
    this._router.use(ALERTS, this._alertsApi.router);

    this._router.use(MOCKS, this._mocksApi);
    this._router.use(ROUTES, this._routesApi);
    this._router.use(ROUTES_VARIANTS, this._routesVariantsApi);
    this._router.use(MOCK_CUSTOM_ROUTES_VARIANTS, this._customRoutesVariantsApi.router);

    this._router.use(LEGACY, this._legacyApi.router);
  }

  _addRouter() {
    this._removeRouter();
    this._routersPath = this._settings.get(ADMIN_API_PATH_OPTION);
    this._core.addRouter(this._routersPath, this._router);
  }

  _removeRouter() {
    if (this._routersPath) {
      this._core.removeRouter(this._routersPath, this._router);
      this._routersPath = null;
    }
  }

  _onChangeSettings(newSettings) {
    if (newSettings.hasOwnProperty(ADMIN_API_PATH_OPTION)) {
      this._addRouter();
    }
  }
}

module.exports = Plugin;
