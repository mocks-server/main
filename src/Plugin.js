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
  BEHAVIORS,
  ABOUT,
  FIXTURES,
  ALERTS,
} = require("@mocks-server/admin-api-paths");

const packageInfo = require("../package.json");
const DeprecatedApi = require("./deprecated/Api");

const Settings = require("./Settings");
const Behaviors = require("./Behaviors");
const Alerts = require("./Alerts");
const Fixtures = require("./Fixtures");
const About = require("./About");

const {
  ADMIN_API_PATH_OPTION,
  ADMIN_API_DEPRECATED_PATHS_OPTION,
  PLUGIN_NAME,
  DEPRECATED_API_PATH,
} = require("./constants");

class Plugin {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = this._core.settings;
    this._deprecatedApi = new DeprecatedApi(core);
    this._settingsApi = new Settings(this._core);
    this._behaviorsApi = new Behaviors(this._core);
    this._alertsApi = new Alerts(this._core);
    this._aboutApi = new About(this._core);
    this._fixturesApi = new Fixtures(this._core);
    core.addSetting({
      name: ADMIN_API_PATH_OPTION,
      type: "string",
      description: `Api path for ${PLUGIN_NAME}`,
      default: DEFAULT_BASE_PATH,
    });

    core.addSetting({
      name: ADMIN_API_DEPRECATED_PATHS_OPTION,
      type: "boolean",
      description: `Disable deprecated paths of ${PLUGIN_NAME}`,
      default: true,
    });

    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  get displayName() {
    return packageInfo.name;
  }

  async init() {
    await this._deprecatedApi.init();
    this._initRouter();
  }

  start() {
    this._stopListeningOnChangeSettings = this._core.onChangeSettings(this._onChangeSettings);
    this._addDeprecatedRouter();
    this._addRouter();
  }

  stop() {
    if (this._stopListeningOnChangeSettings) {
      this._stopListeningOnChangeSettings();
    }
    this._removeDeprecatedRouter();
    this._removeRouter();
  }

  _initRouter() {
    this._router = express.Router();
    this._router.use(SETTINGS, this._settingsApi.router);
    this._router.use(BEHAVIORS, this._behaviorsApi.router);
    this._router.use(ABOUT, this._aboutApi.router);
    this._router.use(FIXTURES, this._fixturesApi.router);
    this._router.use(ALERTS, this._alertsApi.router);
  }

  _addDeprecatedRouter() {
    this._removeDeprecatedRouter();
    if (
      this._settings.get(ADMIN_API_DEPRECATED_PATHS_OPTION) === true &&
      !this._addedDeprecatedRouter
    ) {
      this._core.addRouter(DEPRECATED_API_PATH, this._deprecatedApi.router);
      this._addedDeprecatedRouter = true;
    }
  }

  _removeDeprecatedRouter() {
    if (this._addedDeprecatedRouter) {
      this._core.removeRouter(DEPRECATED_API_PATH, this._deprecatedApi.router);
      this._addedDeprecatedRouter = false;
    }
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
    if (newSettings.hasOwnProperty(ADMIN_API_DEPRECATED_PATHS_OPTION)) {
      this._addDeprecatedRouter();
    }
    if (newSettings.hasOwnProperty(ADMIN_API_PATH_OPTION)) {
      this._addRouter();
    }
  }
}

module.exports = Plugin;
