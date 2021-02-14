/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");
const Boom = require("@hapi/boom");

const { PLUGIN_NAME } = require("./support/constants");

class SettingsApi {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._settings = this._core.settings;
    this._router = express.Router();
    this._router.patch("/", this.patch.bind(this));
    this._router.get("/", this.get.bind(this));
  }

  _validateNewSettings(newSettings) {
    const errors = [];
    Object.keys(newSettings).forEach((newSettingKey) => {
      if (!this._settings.getValidOptionName(newSettingKey)) {
        errors.push(`Invalid option name "${newSettingKey}"`);
      }
    });
    return errors;
  }

  patch(req, res, next) {
    const newSettings = req.body;
    const errors = this._validateNewSettings(newSettings);
    if (errors.length) {
      next(Boom.badRequest(errors.join(". ")));
    } else {
      Object.keys(newSettings).forEach((newSettingKey) => {
        this._tracer.verbose(
          `${PLUGIN_NAME}: Changing setting "${newSettingKey}" to "${newSettings[newSettingKey]}" | ${req.id}`
        );
        this._settings.set(newSettingKey, newSettings[newSettingKey]);
      });
      res.status(204);
      res.send();
    }
  }

  get(req, res) {
    this._tracer.verbose(`${PLUGIN_NAME}: Sending settings | ${req.id}`);
    res.status(200);
    res.send(this._settings.all);
  }

  get router() {
    return this._router;
  }
}

module.exports = SettingsApi;
