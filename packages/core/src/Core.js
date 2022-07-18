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

const tracer = require("./common/legacyTracer");
const AlertsLegacy = require("./alerts/AlertsLegacy");
const VariantHandlers = require("./variant-handlers/VariantHandlers");
const Mock = require("./mock/Mock");
const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const FilesLoaders = require("./files/FilesLoaders");
const Scaffold = require("./scaffold/Scaffold");
const Alerts = require("./alerts/Alerts");
const UpdateNotifier = require("./update-notifier/UpdateNotifier");
const { scopedAlertsMethods } = require("./alerts/legacyHelpers");
const { addEventListener, CHANGE_MOCK, CHANGE_ALERTS, CHANGE_LOGS } = require("./common/events");
const { arrayMerge, deprecatedMessage } = require("./common/helpers");

const MODULE_NAME = "mocks";

const ROOT_OPTIONS = [
  {
    description: "Log level. Can be one of silly, debug, verbose, info, warn or error",
    name: "log",
    type: "string",
    default: "info",
  },
  {
    description: "Array of VariantHandlers to be added. Legacy",
    name: "routesHandlers",
    type: "array",
    default: [],
  },
];

class Core {
  constructor(programmaticConfig = {}, advancedOptions = {}) {
    this._programmaticConfig = programmaticConfig;
    this._eventEmitter = new EventEmitter();
    this._loadedMocks = false;
    this._loadedRoutes = false;

    // Create logger
    this._logger = new Logger();
    this._configLogger = this._logger.namespace("config");

    // LEGACY, to be removed
    this._logger.onChangeGlobalStore(() => {
      this._eventEmitter.emit(CHANGE_LOGS);
    });

    // Create config
    this._config = new Config({ moduleName: MODULE_NAME });
    this._configPlugins = this._config.addNamespace(Plugins.id);
    this._configMock = this._config.addNamespace(Mock.id);
    this._configServer = this._config.addNamespace(Server.id);
    this._configFilesLoaders = this._config.addNamespace(FilesLoaders.id);

    // LEGACY, to be removed
    this._configMocksLegacy = this._config.addNamespace(Mock.legacyId);

    [this._logOption, this._variantHandlersOption] = this._config.addOptions(ROOT_OPTIONS);
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

    // Create update notifier
    this._updateNotifier = new UpdateNotifier({
      alerts: this._alerts.collection(UpdateNotifier.id),
      pkg: advancedOptions.pkg,
    });

    // Create variant handlers
    this._variantHandlers = new VariantHandlers({
      logger: this._logger.namespace(VariantHandlers.id),
      config: this._config.addNamespace(VariantHandlers.id),
    });

    // Create mock
    this._mock = new Mock(
      {
        config: this._configMock,
        alerts: this._alerts.collection(Mock.id),
        logger: this._logger.namespace(Mock.id),
        // LEGACY, to be removed
        legacyConfig: this._configMocksLegacy,
        onChange: () => this._eventEmitter.emit(CHANGE_MOCK),
      },
      this // To be used only by routeHandlers
    );

    // LEGACY, to be removed
    const loaders = this._mock.createLoaders();
    this._loadCollections = loaders.loadCollections;
    this._loadRoutes = loaders.loadRoutes;

    // Create plugins
    this._plugins = new Plugins(
      {
        config: this._configPlugins,
        alerts: this._alerts.collection(Plugins.id),
        logger: this._logger.namespace(Plugins.id),
        // LEGACY, to be removed
        createCollectionsLoader: () => {
          const { loadCollections } = this._mock.createLoaders();
          return (collections) => {
            this._deprecationAlerts.set(
              "loadMocks",
              deprecatedMessage(
                "method",
                "core.loadMocks",
                "core.mock.createLoaders",
                "releases/migrating-from-v3#api"
              )
            );
            return loadCollections(collections);
          };
        },
        createRoutesLoader: () => {
          const { loadRoutes } = this._mock.createLoaders();
          return (routes) => {
            this._deprecationAlerts.set(
              "loadRoutes",
              deprecatedMessage(
                "method",
                "core.loadRoutes",
                "core.mock.createLoaders",
                "releases/migrating-from-v3#api"
              )
            );
            return loadRoutes(routes);
          };
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

    // Create server
    this._server = new Server({
      config: this._configServer,
      logger: this._logger.namespace(Server.id),
      alerts: this._alerts.collection(Server.id),
      routesRouter: this._mock.router,
    });

    const fileLoaders = this._mock.createLoaders();

    // Create files loaders
    this._filesLoader = new FilesLoaders({
      config: this._configFilesLoaders,
      logger: this._logger.namespace(FilesLoaders.id),
      alerts: this._alerts.collection(FilesLoaders.id),
      loadCollections: fileLoaders.loadCollections,
      loadRoutes: fileLoaders.loadRoutes,
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

  async _loadConfig() {
    await this._config.load();

    this._configLogger.debug(
      `Programmatic config: ${JSON.stringify(this._config.programmaticLoadedValues)}`
    );
    this._configLogger.debug(`Config from file: ${JSON.stringify(this._config.fileLoadedValues)}`);
    this._configLogger.debug(`Config from env: ${JSON.stringify(this._config.envLoadedValues)}`);
    this._configLogger.debug(`Config from args: ${JSON.stringify(this._config.argsLoadedValues)}`);
    this._configLogger.verbose(`Config: ${JSON.stringify(this._config.value)}`);
    this._configLogger.info(`Configuration loaded`);
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

    // Update notifier
    this._updateNotifier.init();

    // Init config
    await this._config.init(this._programmaticConfig);
    this._logger.setLevel(this._logOption.value);

    // LEGACY, to be removed
    tracer.set(this._logOption.value);

    // Register plugins, let them add their custom config
    await this._plugins.register();

    if (this._variantHandlersOption.hasBeenSet) {
      this._deprecationAlerts.set(
        "routesHandlers",
        deprecatedMessage(
          "option",
          "routesHandlers",
          "variantHandlers.register",
          "configuration/migrating-from-v3#options"
        )
      );
    }

    await this._variantHandlers.registerConfig(this._variantHandlersOption.value);

    await this._scaffold.init({
      filesLoaderPath: this._filesLoader.path,
    });

    await this._loadConfig();

    // Config is ready, init all
    this._mock.init(this._variantHandlers.handlers);
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

  // LEGACY, to be removed
  addRoutesHandler(VariantHandler) {
    this._deprecationAlerts.set(
      "addRoutesHandler",
      deprecatedMessage(
        "method",
        "core.addRoutesHandler",
        "core.variantHandlers.register",
        "releases/migrating-from-v3#api"
      )
    );
    this._variantHandlers.register([VariantHandler]);
  }

  // LEGACY, to be removed
  loadMocks(collections) {
    this._deprecationAlerts.set(
      "loadMocks",
      deprecatedMessage(
        "method",
        "core.loadMocks",
        "core.mock.createLoaders",
        "releases/migrating-from-v3#api"
      )
    );
    this._loadCollections(collections);
  }

  // LEGACY, to be removed
  loadRoutes(routes) {
    this._deprecationAlerts.set(
      "loadRoutes",
      deprecatedMessage(
        "method",
        "core.loadRoutes",
        "core.mock.createLoaders",
        "releases/migrating-from-v3#api"
      )
    );
    this._loadRoutes(routes);
  }

  // Listeners

  // LEGACY, to be removed
  onChangeMocks(listener) {
    this._deprecationAlerts.set(
      "onChangeMocks",
      deprecatedMessage(
        "method",
        "core.onChangeMocks",
        "core.mock.onChange",
        "releases/migrating-from-v3#api"
      )
    );
    return addEventListener(listener, CHANGE_MOCK, this._eventEmitter);
  }

  // LEGACY, to be removed
  onChangeAlerts(listener) {
    this._deprecationAlerts.set(
      "onChangeAlerts",
      deprecatedMessage(
        "method",
        "core.onChangeAlerts",
        "core.alerts.onChange",
        "releases/migrating-from-v3#api"
      )
    );
    return addEventListener(listener, CHANGE_ALERTS, this._eventEmitter);
  }

  // LEGACY, to be removed
  onChangeLogs(listener) {
    this._deprecationAlerts.set(
      "onChangeLogs",
      deprecatedMessage(
        "method",
        "core.onChangeLogs",
        "core.logger.onChangeGlobalStore",
        "releases/migrating-from-v3#api"
      )
    );
    return addEventListener(listener, CHANGE_LOGS, this._eventEmitter);
  }

  // Expose Server methods and getters

  // LEGACY, to be removed
  restartServer() {
    this._deprecationAlerts.set(
      "restartServer",
      deprecatedMessage(
        "method",
        "core.restartServer",
        "core.server.restart",
        "releases/migrating-from-v3#api"
      )
    );
    return this._server.restart();
  }

  // LEGACY, to be removed
  addRouter(path, router) {
    this._deprecationAlerts.set(
      "addRouter",
      deprecatedMessage(
        "method",
        "core.addRouter",
        "core.server.addRouter",
        "releases/migrating-from-v3#api"
      )
    );
    return this._server.addRouter(path, router);
  }

  // LEGACY, to be removed
  removeRouter(path, router) {
    this._deprecationAlerts.set(
      "removeRouter",
      deprecatedMessage(
        "method",
        "core.removeRouter",
        "core.server.removeRouter",
        "releases/migrating-from-v3#api"
      )
    );
    return this._server.removeRouter(path, router);
  }

  // LEGACY, change by whole alerts object in next major version
  get alerts() {
    return this._alerts.customFlat;
  }

  // Provides access to alerts API while alerts legacy is maintained
  // LEGACY, to be removed
  get alertsApi() {
    return this._alerts;
  }

  // LEGACY, to be removed
  get mocks() {
    this._deprecationAlerts.set(
      "mocks",
      deprecatedMessage("getter", "core.mocks", "core.mock", "releases/migrating-from-v3#api")
    );
    return this._mock;
  }

  // LEGACY, to be removed
  get tracer() {
    this._deprecationAlerts.set(
      "tracer",
      deprecatedMessage(
        "object",
        "core.tracer",
        "core.logger",
        "releases/migrating-from-v3#logger"
      )
    );
    return tracer;
  }

  // LEGACY, to be removed
  get logs() {
    this._deprecationAlerts.set(
      "logs",
      deprecatedMessage(
        "getter",
        "core.logs",
        "core.logger.globalStore",
        "releases/migrating-from-v3#logger"
      )
    );
    return this._logger.globalStore;
  }

  get logger() {
    return this._logger;
  }

  get config() {
    return this._config;
  }

  get server() {
    return this._server;
  }

  get mock() {
    return this._mock;
  }

  get variantHandlers() {
    return this._variantHandlers;
  }
}

module.exports = Core;
