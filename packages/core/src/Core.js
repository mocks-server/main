/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const EventEmitter = require("events");

const deepMerge = require("deepmerge");
const Config = require("@mocks-server/config");
const { Logger } = require("@mocks-server/logger");

const VariantHandlers = require("./variant-handlers/VariantHandlers");
const Mock = require("./mock/Mock");
const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const FilesLoaders = require("./files/FilesLoaders");
const Scaffold = require("./scaffold/Scaffold");
const Alerts = require("./alerts/Alerts");
const UpdateNotifier = require("./update-notifier/UpdateNotifier");
const { CHANGE_MOCK, CHANGE_ALERTS } = require("./common/events");
const { arrayMerge } = require("./common/helpers");
const { version } = require("../package.json");

const MODULE_NAME = "mocks";

const ROOT_OPTIONS = [
  {
    description: "Log level. Can be one of silly, debug, verbose, info, warn or error",
    name: "log",
    type: "string",
    default: "info",
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

    // Create config
    this._config = new Config({ moduleName: MODULE_NAME });
    this._configPlugins = this._config.addNamespace(Plugins.id);
    this._configMock = this._config.addNamespace(Mock.id);
    this._configServer = this._config.addNamespace(Server.id);
    this._configFilesLoaders = this._config.addNamespace(FilesLoaders.id);

    [this._logOption] = this._config.addOptions(ROOT_OPTIONS);
    this._logOption.onChange((level) => {
      this._logger.setLevel(level);
    });

    // Create alerts
    const alertsLogger = this._logger.namespace("alerts");
    this._alerts = new Alerts("alerts", { logger: alertsLogger });
    this._alerts.onChange(() => {
      this._eventEmitter.emit(CHANGE_ALERTS);
    });

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
        onChange: () => this._eventEmitter.emit(CHANGE_MOCK),
      },
      this // To be used only by routeHandlers
    );

    // Create plugins
    this._plugins = new Plugins(
      {
        config: this._configPlugins,
        alerts: this._alerts.collection(Plugins.id),
        logger: this._logger.namespace(Plugins.id),
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
      // TODO, move to another element. Files loader has not to handle specific loaders
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
    // TODO, move to about module
    this._updateNotifier.init();

    // Init config
    await this._config.init(this._programmaticConfig);
    this._logger.setLevel(this._logOption.value);

    // Register plugins, let them add their custom config
    await this._plugins.register();

    await this._variantHandlers.registerConfig();

    // TODO, add to data model
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

  // Expose Server methods and getters

  get alerts() {
    return this._alerts;
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

  // TODO, move to mock
  get variantHandlers() {
    return this._variantHandlers;
  }

  get files() {
    return this._filesLoader;
  }

  // TODO, move to about module
  get version() {
    return version;
  }
}

module.exports = Core;
