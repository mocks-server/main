/*
Copyright 2019-2022 Javier Brea
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
  constructor({ logger, config }) {
    this._logger = logger;
    this._config = config.root;
    this._router = express.Router();
    this._router.patch("/", this.patch.bind(this));
    this._router.get("/", this.get.bind(this));
  }

  _validateNewConfig(newConfig) {
    return this._config.validate(newConfig);
  }

  patch(req, res, next) {
    const newConfig = req.body;
    const { valid, errors } = this._validateNewConfig(newConfig);
    if (!valid && errors.length) {
      next(Boom.badRequest(JSON.stringify(errors)));
    } else {
      this._config.set(newConfig);
      res.status(204);
      res.send();
    }
  }

  get(req, res) {
    this._logger.verbose(`${PLUGIN_NAME}: Sending settings | ${req.id}`);
    res.status(200);
    res.send(this._config.value);
  }

  get router() {
    return this._router;
  }
}

module.exports = SettingsApi;
