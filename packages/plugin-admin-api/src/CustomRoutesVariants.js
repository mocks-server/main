/*
Copyright 2020-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");
const Boom = require("@hapi/boom");

const { addCollectionMiddleware } = require("./support/middlewares");

class CustomRoutesVariants {
  constructor({ logger, mock, getRouteVariants }) {
    this._mock = mock;
    this._logger = logger;
    this._router = express.Router();
    this._getRouteVariants = getRouteVariants;
    addCollectionMiddleware(this._router, {
      name: "custom route variants",
      getItems: this._getCollection.bind(this),
      logger: this._logger,
    });

    this._router.post("/", this.add.bind(this));
    this._router.delete("/", this.delete.bind(this));
  }

  _getCollection() {
    return this._mock.customRouteVariants;
  }

  add(req, res, next) {
    const id = req.body.id;
    const routeVariant = this._getRouteVariants().find(
      (routeVariantCandidate) => routeVariantCandidate.id === id
    );
    if (routeVariant) {
      this._mock.useRouteVariant(id);
      res.status(204);
      res.send();
    } else {
      next(Boom.badRequest(`Route variant with id "${id}" was not found`));
    }
  }

  delete(_req, res) {
    this._mock.restoreRouteVariants();
    res.status(204);
    res.send();
  }

  get router() {
    return this._router;
  }
}

module.exports = CustomRoutesVariants;
