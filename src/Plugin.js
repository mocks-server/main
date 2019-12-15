/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const DeprecatedApi = require("./deprecated/Api");

const Settings = require("./Settings");
const Behaviors = require("./Behaviors");

const {
  ADMIN_API_PATH_OPTION,
  ADMIN_API_DEPRECATED_PATHS_OPTION,
  DEFAULT_API_PATH,
  PLUGIN_NAME,
  SETTINGS_API_PATH,
  BEHAVIORS_API_PATH,
  DEPRECATED_API_PATH
} = require("./constants");

class Plugin {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = this._core.settings;
    this._deprecatedApi = new DeprecatedApi(core);
    this._settingsApi = new Settings(this._core);
    this._behaviorsApi = new Behaviors(this._core);
    core.addSetting({
      name: ADMIN_API_PATH_OPTION,
      type: "string",
      description: `Api path for ${PLUGIN_NAME}`,
      default: DEFAULT_API_PATH
    });

    core.addSetting({
      name: ADMIN_API_DEPRECATED_PATHS_OPTION,
      type: "boolean",
      description: `Disable deprecated paths of ${PLUGIN_NAME}`,
      default: true
    });

    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  async init() {
    await this._deprecatedApi.init();
    this._core.onChangeSettings(this._onChangeSettings);
    this._initRouter();
    this._addDeprecatedRouter();
    this._addRouter();
  }

  _initRouter() {
    this._router = express.Router();
    this._router.use(SETTINGS_API_PATH, this._settingsApi.router);
    this._router.use(BEHAVIORS_API_PATH, this._behaviorsApi.router);
  }

  _addDeprecatedRouter() {
    if (
      this._settings.get(ADMIN_API_DEPRECATED_PATHS_OPTION) === false &&
      this._addedDeprecatedRouter
    ) {
      this._core.removeRouter(DEPRECATED_API_PATH, this._deprecatedApi.router);
      this._addedDeprecatedRouter = false;
    }
    if (
      this._settings.get(ADMIN_API_DEPRECATED_PATHS_OPTION) === true &&
      !this._addedDeprecatedRouter
    ) {
      this._core.addRouter(DEPRECATED_API_PATH, this._deprecatedApi.router);
      this._addedDeprecatedRouter = true;
    }
  }

  _addRouter() {
    if (this._previousRoutersPath) {
      this._core.removeRouter(this._previousRoutersPath, this._router);
    }
    this._previousRoutersPath = this._settings.get(ADMIN_API_PATH_OPTION);
    this._core.addRouter(this._previousRoutersPath, this._router);
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
