/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

const { addCollectionMiddleware, addModelMiddleware } = require("./support/middlewares");

class AlertsApi {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._router = express.Router();
    addCollectionMiddleware(this._router, {
      name: "alerts",
      getItems: this._parseCollection.bind(this),
      tracer: core.tracer,
    });
    addModelMiddleware(this._router, {
      name: "alert",
      getItems: this._getCollection.bind(this),
      parseItem: this._parseModel.bind(this),
      tracer: core.tracer,
      finder: (context) => (item) => item.context === context,
    });
  }

  _parseModel(alert) {
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
  }

  _parseCollection() {
    return this._core.alerts.map(this._parseModel);
  }

  _getCollection() {
    return this._core.alerts;
  }

  get router() {
    return this._router;
  }
}

module.exports = AlertsApi;
