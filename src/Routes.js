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

const { PLUGIN_NAME } = require("./constants");

class RoutesApi {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._router = express.Router();
    this._router.get("/", this.getCollection.bind(this));
    this._router.get("/:id", this.getModel.bind(this));
  }

  getCollection(req, res) {
    this._tracer.verbose(`${PLUGIN_NAME}: Sending routes | ${req.id}`);
    res.status(200);
    res.send(this._core.mocks.plainRoutes);
  }

  getModel(req, res, next) {
    const id = req.params.id;
    this._tracer.verbose(`${PLUGIN_NAME}: Sending route ${id} | ${req.id}`);
    const foundRoute = this._core.mocks.plainRoutes.find((route) => route.id === id);
    if (foundRoute) {
      res.status(200);
      res.send(foundRoute);
    } else {
      next(Boom.notFound(`Route with id "${id}" was not found`));
    }
  }

  get router() {
    return this._router;
  }
}

module.exports = RoutesApi;
