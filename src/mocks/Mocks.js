/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

class Mocks {
  constructor({ getRouteHandlers, getLoadedMocks, getLoadedRoutes }) {
    this._getRouteHandlers = getRouteHandlers;
    this._getLoadedMocks = getLoadedMocks;
    this._getLoadedRoutes = getLoadedRoutes;
    this._router = null;
    this._mocks = [];
    this._routes = [];

    this.router = this.router.bind(this);
  }

  _reloadRouter() {
    this._router = express.Router();
  }

  load() {
    // TODO, validate
    this._routes = this._getLoadedRoutes();
    this._mocks = this._getLoadedMocks();
    console.log("routes------------------");
    console.log(this._routes);
    console.log("mocks------------------");
    console.log(this._mocks);
    this._reloadRouter();
  }

  init() {
    this._reloadRouter();
  }

  router(req, res, next) {
    this._router(req, res, next);
  }

  set current(id) {}

  get current() {}
}

module.exports = Mocks;
