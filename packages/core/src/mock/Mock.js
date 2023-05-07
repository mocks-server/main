/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const EventEmitter = require("events");

const express = require("express");

const { addEventListener, CHANGE_MOCK } = require("../common/Events");
const { DefinitionsManager } = require("./DefinitionsManager");
const { Collections } = require("./collections/Collections");
const { Routes } = require("./routes/Routes");
const { getPlainCollections, getPlainRoutes, getPlainRouteVariants } = require("./helpers");
const { compileRouteValidator } = require("./validations");

class Mock {
  static get id() {
    return "mock";
  }

  constructor({ config, logger, onChange, alerts }, core) {
    this._eventEmitter = new EventEmitter();
    this._core = core;

    this._alerts = alerts;
    this._logger = logger;
    this._config = config;
    this._onChange = onChange;

    this._router = null;
    this._collectionDefinitions = [];
    this._collections = [];
    this._plainCollections = [];
    this._routesDefinitions = [];
    this._plainRoutes = [];
    this._plainVariants = [];
    this._routes = [];
    this._customVariants = [];
    this._customVariantsCollection = null;

    this.router = this.router.bind(this);
    this._reloadRouter = this._reloadRouter.bind(this);

    this._routesManager = new Routes({
      alerts: this._alerts.collection(Routes.id),
      logger: this._logger.namespace(Routes.id),
      config: this._config.addNamespace(Routes.id),
      onChange: this._reloadRouter,
      getPlainRoutes: this._getPlainRoutes.bind(this),
      getPlainVariants: this._getPlainVariants.bind(this),
    });

    this._collectionsManager = new Collections({
      routesManager: this._routesManager,
      alerts: this._alerts.collection(Collections.id),
      logger: this._logger.namespace(Collections.id),
      config: this._config.addNamespace(Collections.id),
      onChange: this._reloadRouter,
      getPlainCollections: this._getPlainCollections.bind(this),
    });

    // Create collections loaders
    this._collectionDefinitionsManager = new DefinitionsManager({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._loadedCollections = true;
        if (this._loadedRoutes) {
          this.load();
        }
      },
    });

    // Create routes loaders
    this._routeLoadersManager = new DefinitionsManager({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._loadedRoutes = true;
        if (this._loadedCollections) {
          this.load();
        }
      },
    });
  }

  _emitChange() {
    this._eventEmitter.emit(CHANGE_MOCK);
    this._onChange();
  }

  _reloadRouter() {
    if (this._collectionsManager.current) {
      this._router = this._collectionsManager.current.router;
    } else {
      this._router = express.Router();
    }
    this._emitChange();
  }

  _processCollections() {
    this._collectionsManager.load(this._collectionDefinitions);
    this._collections = this._collectionsManager.get();
  }

  _processRoutes() {
    this._routesManager.load(this._routesDefinitions, this._variantHandlers);
    this._routes = this._routesManager.get();
  }

  load() {
    this._routesDefinitions = this._routeLoadersManager.definitions;
    this._collectionDefinitions = this._collectionDefinitionsManager.definitions;
    this._processRoutes();
    this._processCollections();
    this._plainRoutes = getPlainRoutes(this._routesDefinitions, this._routes);
    this._plainVariants = getPlainRouteVariants(this._routes);
    this._plainCollections = getPlainCollections(this._collections, this._collectionDefinitions);
    // Force emit change because of plain routes and collections. To be removed when they are migrated to managers
    this._emitChange();
  }

  init(variantHandlers) {
    compileRouteValidator(variantHandlers);
    this._variantHandlers = variantHandlers;
  }

  router(req, res, next) {
    this._router(req, res, next);
  }

  // TODO, deprecated
  restoreRouteVariants() {
    this._collectionsManager.current.resetRoutes();
  }

  // TODO, deprecated
  useRouteVariant(routeId) {
    this._collectionsManager.current.useRoute(routeId);
  }

  // TODO, deprecated
  get customRouteVariants() {
    return this._getPlainCustomRouteVariants();
  }

  onChange(listener) {
    return addEventListener(listener, CHANGE_MOCK, this._eventEmitter);
  }

  createLoaders() {
    return {
      loadRoutes: this._routeLoadersManager.createLoader(),
      loadCollections: this._collectionDefinitionsManager.createLoader(),
    };
  }

  _getPlainCustomRouteVariants() {
    return [...this._customVariants];
  }

  _getPlainCollections() {
    return [...this._plainCollections];
  }

  _getPlainRoutes() {
    return [...this._plainRoutes];
  }

  _getPlainVariants() {
    return [...this._plainVariants];
  }

  get routes() {
    return this._routesManager;
  }

  get collections() {
    return this._collectionsManager;
  }
}

module.exports = Mock;
