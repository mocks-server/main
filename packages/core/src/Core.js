/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const deepMerge = require("deepmerge");
const EventEmitter = require("events");

const Config = require("@mocks-server/config");
const { Logger } = require("@mocks-server/logger");

const { CHANGE_MOCKS, CHANGE_ALERTS, CHANGE_LOGS } = require("./eventNames");
const tracer = require("./tracer");
const Loaders = require("./Loaders");
const AlertsLegacy = require("./AlertsLegacy");
const RoutesHandlers = require("./routes-handlers/RoutesHandlers");
const Mocks = require("./mocks/Mocks");
const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const FilesLoader = require("./files-loader/FilesLoader");

const { scopedAlertsMethods, addEventListener, arrayMerge } = require("./support/helpers");
const Scaffold = require("./scaffold/Scaffold");
const Alerts = require("./Alerts");

const MODULE_NAME = "mocks";

const ROOT_OPTIONS = [
  {
    description: "Log level. Can be one of silly, debug, verbose, info, warn or error",
    name: "log",
    type: "string",
    default: "info",
  },
  {
    description: "Array of RouteHandlers to be added",
    name: "routesHandlers",
    type: "array",
    default: [],
  },
];

class Core {
  constructor(programmaticConfig = {}) {
    this._programmaticConfig = programmaticConfig;
    this._eventEmitter = new EventEmitter();
    this._loadedMocks = false;
    this._loadedRoutes = false;

    // Create logger
    this._logger = new Logger();
    this._configLogger = this._logger.namespace("config");
    this._logger.onChangeGlobalStore(() => {
      this._eventEmitter.emit(CHANGE_LOGS);
    });

    // Create config
    this._config = new Config({ moduleName: MODULE_NAME });
    this._configPlugins = this._config.addNamespace(Plugins.id);
    this._configMocks = this._config.addNamespace(Mocks.id);
    this._configServer = this._config.addNamespace(Server.id);
    this._configFilesLoader = this._config.addNamespace(FilesLoader.id);

    [this._logOption, this._routesHandlersOption] = this._config.addOptions(ROOT_OPTIONS);
    this._logOption.onChange((level) => {
      this._logger.setLevel(level);
    });

    // LEGACY, to be removed
    this._logOption.onChange(tracer.set);

    // Create alerts
    const alertsLogger = this._logger.namespace("alerts");
    const alertsLegacyLogger = alertsLogger.namespace("deprecated");
    this._alerts = new Alerts("alerts", { logger: alertsLogger });
    this._alerts.onChange(() => {
      this._eventEmitter.emit(CHANGE_ALERTS);
    });
    this._alertsLegacy = new AlertsLegacy({
      alerts: this._alerts,
      logger: alertsLegacyLogger,
    });
    this._deprecationAlerts = this._alerts.collection("deprecated");

    // Create mocks loaders
    this._mocksLoaders = new Loaders({
      onLoad: () => {
        this._loadedMocks = true;
        if (this._loadedRoutes) {
          this._mocks.load();
        }
      },
    });

    // Create routes loaders
    this._routesLoaders = new Loaders({
      onLoad: () => {
        this._loadedRoutes = true;
        if (this._loadedMocks) {
          this._mocks.load();
        }
      },
    });

    this._loadMocks = this._mocksLoaders.new();
    this._loadRoutes = this._routesLoaders.new();

    // Create plugins
    this._plugins = new Plugins(
      {
        config: this._configPlugins,
        alerts: this._alerts.collection(Plugins.id),
        logger: this._logger.namespace(Plugins.id),
        createMocksLoader: () => {
          return this._mocksLoaders.new();
        },
        createRoutesLoader: () => {
          return this._routesLoaders.new();
        },
        // LEGACY, remove when legacy alerts are removed
        ...scopedAlertsMethods(
          Plugins.id,
          this._alertsLegacy.add,
          this._alertsLegacy.remove,
          this._alertsLegacy.rename
        ),
      },
      this //To be used only by plugins
    );

    // Create routes handlers
    this._routesHandlers = new RoutesHandlers({
      logger: this._logger.namespace("routesHandlers"),
    });

    // Create mocks
    this._mocks = new Mocks(
      {
        config: this._configMocks,
        alerts: this._alerts.collection(Mocks.id),
        logger: this._logger.namespace(Mocks.id),
        getLoadedMocks: () => this._mocksLoaders.contents,
        getLoadedRoutes: () => this._routesLoaders.contents,
        onChange: () => this._eventEmitter.emit(CHANGE_MOCKS),
      },
      this // To be used only by routeHandlers
    );

    // Create server
    this._server = new Server({
      config: this._configServer,
      logger: this._logger.namespace(Server.id),
      alerts: this._alerts.collection(Server.id),
      mocksRouter: this._mocks.router,
    });

    // Create files loaders
    this._filesLoader = new FilesLoader({
      config: this._configFilesLoader,
      logger: this._logger.namespace(FilesLoader.id),
      alerts: this._alerts.collection(FilesLoader.id),
      loadMocks: this._mocksLoaders.new(),
      loadRoutes: this._routesLoaders.new(),
    });

    // Create scaffold
    this._scaffold = new Scaffold({
      config: this._config, // It needs the whole configuration to get option properties and create scaffold
      alerts: this._alerts.collection(Scaffold.id),
      logger: this._logger.namespace(Scaffold.id),
    });

    this._inited = false;
    this._stopPluginsPromise = null;
    this._startPluginsPromise = null;
  }

  async _startPlugins() {
    if (!this._startPluginsPromise) {
      this._startPluginsPromise = this._plugins.start();
    }
    return this._startPluginsPromise.then(() => {
      this._startPluginsPromise = null;
    });
  }

  async _stopPlugins() {
    if (!this._stopPluginsPromise) {
      this._stopPluginsPromise = this._plugins.stop();
    }
    return this._stopPluginsPromise.then(() => {
      this._stopPluginsPromise = null;
    });
  }

  // Public methods

  async init(programmaticConfig) {
    if (this._inited) {
      // in case it has been initializated manually before
      return Promise.resolve();
    }
    this._inited = true;

    if (programmaticConfig) {
      this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig, {
        arrayMerge,
      });
    }

    // Init config
    await this._config.init(this._programmaticConfig);
    this._logger.setLevel(this._logOption.value);

    // LEGACY, to be removed
    tracer.set(this._logOption.value);

    // Register plugins, let them add their custom config
    await this._plugins.register();

    // Register routes handlers
    await this._routesHandlers.register(this._routesHandlersOption.value);

    await this._scaffold.init({
      filesLoaderPath: this._filesLoader.path,
    });

    // load config
    await this._config.load();

    // Config is ready, init all
    this._mocks.init(this._routesHandlers.handlers);
    await this._server.init();
    await this._filesLoader.init();
    return this._plugins.init();
  }

  async start() {
    await this.init();
    await this._server.start();
    this._filesLoader.start();
    return this._startPlugins();
  }

  async stop() {
    await this._server.stop();
    this._filesLoader.stop();
    return this._stopPlugins();
  }

  addRoutesHandler(RoutesHandler) {
    this._routesHandlers.add(RoutesHandler);
  }

  loadMocks(mocks) {
    this._loadMocks(mocks);
  }

  loadRoutes(routes) {
    this._loadRoutes(routes);
  }

  // Listeners

  onChangeMocks(listener) {
    return addEventListener(listener, CHANGE_MOCKS, this._eventEmitter);
  }

  onChangeAlerts(listener) {
    return addEventListener(listener, CHANGE_ALERTS, this._eventEmitter);
  }

  onChangeLogs(listener) {
    return addEventListener(listener, CHANGE_LOGS, this._eventEmitter);
  }

  // Expose Server methods and getters

  restartServer() {
    return this._server.restart();
  }

  addRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  removeRouter(path, router) {
    return this._server.removeCustomRouter(path, router);
  }

  // Expose child objects

  // LEGACY, change by whole alerts object in next major version
  get alerts() {
    return this._alerts.customFlat;
  }

  get mocks() {
    return this._mocks;
  }

  // LEGACY, to be removed
  get tracer() {
    this._deprecationAlerts.set("tracer", "Usage of tracer is deprecated. Use logger instead");
    return tracer;
  }

  get logs() {
    return this._logger.globalStore;
  }

  get logger() {
    return this._logger;
  }

  get config() {
    return this._config;
  }
}

module.exports = Core;
