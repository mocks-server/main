/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const EventEmitter = require("events");

const {
  INIT,
  START,
  STOP,
  CHANGE_LEGACY_MOCKS,
  CHANGE_MOCKS,
  CHANGE_SETTINGS,
  CHANGE_ALERTS,
  LOAD_LEGACY_MOCKS,
  LOAD_MOCKS,
  LOAD_ROUTES,
} = require("./eventNames");
const tracer = require("./tracer");

const Config = require("./Config");
const Orchestrator = require("./Orchestrator");
const Loaders = require("./Loaders");
const Alerts = require("./Alerts");

const RoutesHandlers = require("./routes-handlers/RoutesHandlers");
const Mocks = require("./mocks/Mocks");
const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const LegacyMocks = require("./mocks-legacy/Mocks");
const Settings = require("./settings/Settings");

const { scopedAlertsMethods, addEventListener } = require("./support/helpers");

class Core {
  constructor(programmaticConfig) {
    this._eventEmitter = new EventEmitter();

    this._alerts = new Alerts({
      // TODO, rename into onChange
      onChangeValues: (alerts) => {
        this._eventEmitter.emit(CHANGE_ALERTS, alerts);
      },
    });

    this._legacyMocksLoaders = new Loaders({
      onLoad: () => {
        this._eventEmitter.emit(LOAD_LEGACY_MOCKS);
      },
    });

    this._mocksLoaders = new Loaders({
      onLoad: () => {
        this._eventEmitter.emit(LOAD_MOCKS);
      },
    });

    this._routesLoaders = new Loaders({
      onLoad: () => {
        this._eventEmitter.emit(LOAD_ROUTES);
      },
    });

    this._config = new Config({
      programmaticConfig,
      ...scopedAlertsMethods("config", this._alerts.add, this._alerts.remove),
    });

    // TODO, refactor. Pass specific callbacks instead of objects
    this._settings = new Settings(this._eventEmitter, this._config);

    this._plugins = new Plugins(
      {
        createLegacyMocksLoader: () => {
          return this._legacyMocksLoaders.new();
        },
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
        getLoadedMocks: () => this._mocksLoaders.contents,
        getLoadedRoutes: () => this._routesLoaders.contents,
        getCurrentMock: () => this._settings.get("mock"),
        getDelay: () => this._settings.get("delay"),
        onChange: () => this._eventEmitter.emit(CHANGE_MOCKS),
        ...scopedAlertsMethods(
          "mocks",
          this._alerts.add,
          this._alerts.remove,
          this._alerts.rename
        ),
      },
      this //To be used only by routeHandlers
    );

    // TODO, remove
    this._legacyMocks = new LegacyMocks(
      this._eventEmitter,
      this._settings,
      this._legacyMocksLoaders,
      this,
      scopedAlertsMethods("legacy-mocks", this._alerts.add, this._alerts.remove)
    );

    // TODO, refactor. Pass specific callbacks instead of objects
    this._server = new Server(this._eventEmitter, this._settings, this._legacyMocks, this, {
      mocksRouter: this._mocks.router,
      ...scopedAlertsMethods("server", this._alerts.add, this._alerts.remove),
    });

    // TODO, remove, add orchestration event listeners here
    this._orchestrator = new Orchestrator(
      this._eventEmitter,
      this._legacyMocks,
      this._server,
      this._mocks
    );

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

  // Listeners

  // TODO, remove legacy method
  onChangeLegacyMocks(listener) {
    return addEventListener(listener, CHANGE_LEGACY_MOCKS, this._eventEmitter);
  }

  onChangeMocks(listener) {
    return addEventListener(listener, CHANGE_MOCKS, this._eventEmitter);
  }

  onChangeSettings(listener) {
    return addEventListener(listener, CHANGE_SETTINGS, this._eventEmitter);
  }

  onChangeAlerts(listener) {
    return addEventListener(listener, CHANGE_ALERTS, this._eventEmitter);
  }

  async init(options) {
    if (this._inited) {
      return Promise.resolve();
    }
    await this._config.init(options);
    this._inited = true;
    // Register routes handlers
    await this._routesHandlers.register();
    // Register plugins, let them add their custom settings
    await this._plugins.register(this._config.coreOptions.plugins);
    // Init settings, read command line arguments, etc.
    await this._settings.init(this._config.options);
    // Settings are ready, init all
    await this._mocks.init(this._routesHandlers.handlers);
    await this._legacyMocks.init();
    await this._server.init();
    return this._plugins.init().then(() => {
      this._eventEmitter.emit(INIT, this);
    });
  }

  async start() {
    await this.init(); // in case it has not been initializated manually before
    await this._server.start();
    return this._startPlugins().then(() => {
      this._eventEmitter.emit(START, this);
    });
  }

  async stop() {
    await this._server.stop();
    return this._stopPlugins().then(() => {
      this._eventEmitter.emit(STOP, this);
    });
  }

  // TODO, deprecate method, use addRouter
  addCustomRouter(path, router) {
    tracer.deprecationWarn("addCustomRouter", "addRouter");
    return this.addRouter(path, router);
  }

  addRouter(path, router) {
    return this._server.addCustomRouter(path, router);
  }

  removeRouter(path, router) {
    return this._server.removeCustomRouter(path, router);
  }

  // TODO, deprecate method, use addSetting
  addCustomSetting(option) {
    tracer.deprecationWarn("addCustomSetting", "addSetting");
    return this.addSetting(option);
  }

  addSetting(option) {
    return this._settings.addCustom(option);
  }

  // TODO, remove legacy method
  addFixturesHandler(Handler) {
    return this._legacyMocks.addFixturesHandler(Handler);
  }

  // Expose Server methods and getters

  // TODO, deprecate method, use restartServer
  restart() {
    tracer.deprecationWarn("restart", "restartServer");
    return this.restartServer();
  }

  restartServer() {
    return this._server.restart();
  }

  // TODO, remove
  get serverError() {
    return this._server.error;
  }

  // Expose child objects

  get alerts() {
    return this._alerts.values;
  }

  get settings() {
    return this._settings;
  }

  get mocks() {
    return this._mocks;
  }

  // TODO, remove
  get behaviors() {
    return this._legacyMocks.behaviors;
  }

  // TODO, remove
  get fixtures() {
    return this._legacyMocks.fixtures;
  }

  // TODO, deprecate getter
  get features() {
    tracer.deprecationWarn("features getter", "behaviors getter");
    return this._legacyMocks.behaviors;
  }

  get tracer() {
    return tracer;
  }
}

module.exports = Core;
