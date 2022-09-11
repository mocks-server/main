/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const EventEmitter = require("events");

const express = require("express");

const { addEventListener, CHANGE_MOCK } = require("../common/events");
const Loaders = require("./Loaders");
const Collections = require("./Collections");
const Routes = require("./Routes");
const {
  getPlainCollections,
  getPlainRoutes,
  getPlainRouteVariants,
  addCustomVariant,
  getRouteVariants,
  getCollections,
  getCollection,
} = require("./helpers");
const { getIds, compileRouteValidator } = require("./validations");

const SELECTED_COLLECTION_ID = "selected";
const EMPTY_ALERT_ID = "empty";
const LOAD_NAMESPACE = "load";

class Mock {
  static get id() {
    return "mock";
  }

  constructor({ config, logger, onChange, alerts }, core) {
    this._eventEmitter = new EventEmitter();
    this._logger = logger;

    this._config = config;

    this._onChange = onChange;
    this._core = core;

    this._alerts = alerts;

    this._routesConfig = this._config.addNamespace(Routes.id);
    this._routesLogger = logger.namespace(Routes.id);
    this._loggerLoadRoutes = this._routesLogger.namespace(LOAD_NAMESPACE);
    this._alertsRoutes = alerts.collection(Routes.id);
    this._alertsLoadRoutes = this._alertsRoutes.collection(LOAD_NAMESPACE);

    // TODO, move routes logic to Routes Class
    this._routes = new Routes({
      logger: this._routesLogger,
      config: this._routesConfig,
      onChangeDelay: this._emitChange.bind(this),
      getPlainRoutes: this._getPlainRoutes.bind(this),
      getPlainVariants: this._getPlainVariants.bind(this),
    });

    // TODO, move collections logic to Collections Class
    this._collectionsConfig = this._config.addNamespace(Collections.id);
    this._collectionsLogger = logger.namespace(Collections.id);
    this._loggerLoadCollections = this._collectionsLogger.namespace(LOAD_NAMESPACE);
    this._alertsCollections = alerts.collection(Collections.id);
    this._alertsLoadCollections = this._alertsCollections.collection(LOAD_NAMESPACE);

    this._collectionsInstance = new Collections({
      logger: this._collectionsLogger,
      config: this._collectionsConfig,
      onChangeSelected: this._setCurrent.bind(this),
      getIds: this._getCollectionsIds.bind(this),
      getPlainCollections: this._getPlainCollections.bind(this),
      getSelected: () => {
        return this._selectedId;
      },
    });

    // Create collections loaders
    this._collectionsLoaders = new Loaders({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._loadedCollections = true;
        if (this._loadedRoutes) {
          this.load();
        }
      },
    });

    // Create routes loaders
    this._routesLoaders = new Loaders({
      onLoad: () => {
        // First time wait for other loader to have finished
        this._loadedRoutes = true;
        if (this._loadedCollections) {
          this.load();
        }
      },
    });

    this._router = null;
    this._collectionsDefinitions = [];
    this._collections = [];
    this._plainCollections = [];
    this._routesDefinitions = [];
    this._plainRoutes = [];
    this._plainVariants = [];
    this._routeVariants = [];
    this._customVariants = [];
    this._customVariantsCollection = null;

    this.router = this.router.bind(this);
    this._getDelay = this._getDelay.bind(this);
  }

  _emitChange() {
    this._eventEmitter.emit(CHANGE_MOCK);
    this._onChange();
  }

  _getDelay() {
    return this._routes.delay;
  }

  // Temportal workaround to know selected collection in this class while it has a deprecated option setting the same value.
  // TODO, move to Collections class
  _getCollectionSelected() {
    return this._collectionsInstance._selectedOption.value;
  }

  _reloadRouter() {
    if (this._customVariantsCollection) {
      this._router = this._customVariantsCollection.router;
    } else if (this._selectedCollection) {
      this._router = this._selectedCollection.router;
    } else {
      this._router = express.Router();
    }
    this._emitChange();
  }

  _processCollections() {
    this._loggerLoadCollections.debug("Processing loaded collections");
    this._loggerLoadCollections.silly(JSON.stringify(this._collectionsDefinitions));
    this._collections = getCollections({
      collectionsDefinitions: this._collectionsDefinitions,
      alerts: this._alertsLoadCollections,
      logger: this._loggerLoadCollections,
      loggerRoutes: this._routesLogger,
      routeVariants: this._routeVariants,
      getGlobalDelay: this._getDelay,
    });
  }

  _processRoutes() {
    this._loggerLoadRoutes.debug("Processing loaded routes");
    this._loggerLoadRoutes.silly(JSON.stringify(this._routesDefinitions));
    this._routeVariants = getRouteVariants({
      routesDefinitions: this._routesDefinitions,
      alerts: this._alertsLoadRoutes,
      alertsRoutes: this._alertsRoutes,
      logger: this._loggerLoadRoutes,
      loggerRoutes: this._routesLogger,
      routeHandlers: this._variantHandlers,
      core: this._core,
    });
    this._loggerLoadRoutes.debug(`Processed ${this._routeVariants.length} route variants`);
  }

  load() {
    this._routesDefinitions = this._routesLoaders.contents;
    this._collectionsDefinitions = this._collectionsLoaders.contents;
    this._processRoutes();
    this._processCollections();
    this._collectionsIds = getIds(this._collections);
    this._plainRoutes = getPlainRoutes(this._routesDefinitions, this._routeVariants);
    this._plainVariants = getPlainRouteVariants(this._routeVariants);
    this._plainCollections = getPlainCollections(this._collections, this._collectionsDefinitions);
    this._setCurrent(this._getCollectionSelected());
  }

  init(variantHandlers) {
    compileRouteValidator(variantHandlers);
    this._variantHandlers = variantHandlers;
  }

  router(req, res, next) {
    this._router(req, res, next);
  }

  _setCurrent(id) {
    this._logger.verbose(`Trying to select collection '${id}'`);
    let selected;
    this._alertsCollections.remove(SELECTED_COLLECTION_ID);
    if (!id) {
      selected = this._collections[0];
      if (selected) {
        this._alertsCollections.set(
          SELECTED_COLLECTION_ID,
          "Option 'mock.collections.selected' was not defined. Selecting the first collection found"
        );
      } else {
        this._alertsCollections.set(
          SELECTED_COLLECTION_ID,
          "Option 'mock.collections.selected' was not defined"
        );
      }
    } else {
      selected = this._collections.find((collection) => collection.id === id);
      if (!selected) {
        selected = this._collections[0];
        if (selected) {
          this._alertsCollections.set(
            SELECTED_COLLECTION_ID,
            `Collection '${id}' was not found. Selecting the first one found`
          );
        }
      }
    }
    if (!selected) {
      this._alertsCollections.set(EMPTY_ALERT_ID, "No collections found");
    } else {
      this._logger.info(`Selected collection: '${selected.id}'`);
      this._alertsCollections.remove(EMPTY_ALERT_ID);
    }

    this._selectedCollection = selected;
    this._selectedId = (selected && selected.id) || null;
    this._stopUsingVariants();
    this._reloadRouter();
  }

  _stopUsingVariants() {
    this._customVariants = [];
    this._customVariantsCollection = null;
  }

  _createCustomCollection() {
    // TODO, set custom collection. Reserve "custom" id in collections for this one
    const selectedCollectionId = this._selectedId;
    const alerts = this._alertsLoadCollections.collection("custom");
    alerts.clean();
    this._customVariantsCollection = getCollection({
      collectionDefinition: {
        id: `custom-variants:from:${selectedCollectionId}`,
        from: selectedCollectionId,
        routes: this._customVariants,
      },
      collectionsDefinitions: this._collectionsDefinitions,
      routeVariants: this._routeVariants,
      getGlobalDelay: this._getDelay,
      alerts,
      logger: this._loggerLoadCollections,
      loggerRoutes: this._routesLogger,
    });
  }

  restoreRouteVariants() {
    this._stopUsingVariants();
    this._reloadRouter();
  }

  useRouteVariant(variantId) {
    // TODO, validate variantId
    this._customVariants = addCustomVariant(variantId, this._customVariants);
    this._createCustomCollection();
    this._reloadRouter();
  }

  onChange(listener) {
    return addEventListener(listener, CHANGE_MOCK, this._eventEmitter);
  }

  createLoaders() {
    return {
      loadRoutes: this._routesLoaders.new(),
      loadCollections: this._collectionsLoaders.new(),
    };
  }

  _getPlainCustomRouteVariants() {
    return [...this._customVariants];
  }

  get customRouteVariants() {
    return this._getPlainCustomRouteVariants();
  }

  _getCollectionsIds() {
    return [...this._collectionsIds];
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
    return this._routes;
  }

  get collections() {
    return this._collectionsInstance;
  }
}

module.exports = Mock;
