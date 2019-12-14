/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const DeprecatedApi = require("./deprecated/Api");

const {
  ADMIN_API_PATH_OPTION,
  ADMIN_API_DEPRECATED_PATHS_OPTION,
  DEFAULT_API_PATH
} = require("./constants");

class Plugin {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._deprecatedApi = new DeprecatedApi(core);
    core.addSetting({
      name: ADMIN_API_PATH_OPTION,
      type: "string",
      description: "Api path for the plugin-admin-api",
      default: DEFAULT_API_PATH
    });

    core.addSetting({
      name: ADMIN_API_DEPRECATED_PATHS_OPTION,
      type: "boolean",
      description: "Disable deprecated paths of plugin-admin-api",
      default: true
    });
  }

  async init() {
    this._settings = this._core.settings;
    if (this._settings.get(ADMIN_API_DEPRECATED_PATHS_OPTION) === true) {
      await this._deprecatedApi.init();
    }
    this._addRouter();
  }

  _addRouter() {
    this._router = express.Router();
    // TODO, instantiate here all child routers
    this._router.use("/", (req, res) => {
      res.send({
        listening: true
      });
    });

    this._core.addRouter(this._settings.get(ADMIN_API_PATH_OPTION), this._router);
    return Promise.resolve();
  }
}

module.exports = Plugin;
