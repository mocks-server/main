/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const deepMerge = require("deepmerge");
const EventEmitter = require("events");

const Config = require("@mocks-server/config");

const { CHANGE_MOCKS, CHANGE_ALERTS } = require("./eventNames");
const tracer = require("./tracer");
const Loaders = require("./Loaders");
const Alerts = require("./Alerts");
const RoutesHandlers = require("./routes-handlers/RoutesHandlers");
const Mocks = require("./mocks/Mocks");
const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");

const { scopedAlertsMethods, addEventListener, arrayMerge } = require("./support/helpers");

const MODULE_NAME = "mocks";
const CONFIG_PLUGINS_NAMESPACE = "plugins";
const CONFIG_MOCKS_NAMESPACE = "mocks";
const CONFIG_SERVER_NAMESPACE = "server";

const ROOT_OPTIONS = [
  {
    name: "routesHandlers",
    type: "array",
    default: [],
  },
  {
    name: "log",
    type: "string",
    default: "info",
  },
];

class Core {
  constructor(programmaticConfig = {}) {
    this._programmaticConfig = programmaticConfig;

    this._eventEmitter = new EventEmitter();
    this._loadedMocks = false;
    this._loadedRoutes = false;

    this._config = new Config({ moduleName: MODULE_NAME });
    this._configPlugins = this._config.addNamespace(CONFIG_PLUGINS_NAMESPACE);
    this._configMocks = this._config.addNamespace(CONFIG_MOCKS_NAMESPACE);
    this._configServer = this._config.addNamespace(CONFIG_SERVER_NAMESPACE);

    [this._routesHandlersOption, this._logOption] = this._config.addOptions(ROOT_OPTIONS);

    this._alerts = new Alerts({
      onChange: (alerts) => {
        this._eventEmitter.emit(CHANGE_ALERTS, alerts);
      },
    });

    this._mocksLoaders = new Loaders({
      onLoad: () => {
        this._loadedMocks = true;
        if (this._loadedRoutes) {
          this._mocks.load();
        }
      },
    });

    this._routesLoaders = new Loaders({
      onLoad: () => {
        this._loadedRoutes = true;
        if (this._loadedMocks) {
          this._mocks.load();
        }
      },
    });

    this._plugins = new Plugins(
      {
        config: this._configPlugins,
        createMocksLoader: () => {
          return this._mocksLoaders.new();
        },
        createRoutesLoader: () => {
          return this._routesLoaders.new();
        },
        ...scopedAlertsMethods(
          "plugins",
          this._alerts.add,
          this._alerts.remove,
          this._alerts.rename
        ),
      },
      this //To be used only by plugins
    );

    this._routesHandlers = new RoutesHandlers();

    this._mocks = new Mocks(
      {
        config: this._configMocks,
        getLoadedMocks: () => this._mocksLoaders.contents,
        getLoadedRoutes: () => this._routesLoaders.contents,
        onChange: () => this._eventEmitter.emit(CHANGE_MOCKS),
        ...scopedAlertsMethods(
          "mocks",
          this._alerts.add,
          this._alerts.remove,
          this._alerts.rename
        ),
      },
      this // To be used only by routeHandlers
    );

    this._server = new Server({
      config: this._configServer,
      mocksRouter: this._mocks.router,
      ...scopedAlertsMethods("server", this._alerts.add, this._alerts.remove),
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
    if (programmaticConfig) {
      this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig, {
        arrayMerge,
      });
    }
    if (this._inited) {
      // in case it has been initializated manually before
      return Promise.resolve();
    }
    this._inited = true;

    // Init config
    await this._config.init(this._programmaticConfig);
    tracer.set(this._logOption.value);

    // Register plugins, let them add their custom config
    await this._plugins.register();

    // Register routes handlers
    await this._routesHandlers.register(this._routesHandlersOption.value);

    // Start config
    await this._config.start();

    // Config is ready, init all
    this._mocks.init(this._routesHandlers.handlers);
    await this._server.init();
    return this._plugins.init();
  }

  async start() {
    await this.init();
    await this._server.start();
    return this._startPlugins();
  }

  async stop() {
    await this._server.stop();
    return this._stopPlugins();
  }

  addRoutesHandler(RoutesHandler) {
    this._routesHandlers.add(RoutesHandler);
  }

  // Listeners

  onChangeMocks(listener) {
    return addEventListener(listener, CHANGE_MOCKS, this._eventEmitter);
  }

  onChangeAlerts(listener) {
    return addEventListener(listener, CHANGE_ALERTS, this._eventEmitter);
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

  get alerts() {
    return this._alerts.values;
  }

  get mocks() {
    return this._mocks;
  }

  get tracer() {
    return tracer;
  }

  get config() {
    return this._config;
  }
}

module.exports = Core;
