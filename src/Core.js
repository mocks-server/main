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
  CHANGE_SETTINGS,
  CHANGE_ALERTS,
  LOAD_LEGACY_MOCKS,
} = require("./eventNames");
const tracer = require("./tracer");

const Config = require("./Config");
const Orchestrator = require("./Orchestrator");
const Loaders = require("./Loaders");
const Alerts = require("./Alerts");

const Plugins = require("./plugins/Plugins");
const Server = require("./server/Server");
const LegacyMocks = require("./mocks-legacy/Mocks");
const Settings = require("./settings/Settings");

const { scopedAlertsMethods } = require("./support/helpers");

class Core {
  constructor(programmaticConfig) {
    this._eventEmitter = new EventEmitter();

    // TODO, refactor all pieces as the next one. They should receive callbacks
    // They should never access directly to the full core
    // (expect in cases where it is needed to be passed to plugins or another external pieces)
    this._alerts = new Alerts({
      onChangeValues: (alerts) => {
        this._eventEmitter.emit(CHANGE_ALERTS, alerts);
      },
    });

    this._legacyMocksLoaders = new Loaders({
      onLoad: () => {
        this._eventEmitter.emit(LOAD_LEGACY_MOCKS);
      },
    });

    this._config = new Config({
      programmaticConfig,
      ...scopedAlertsMethods("config", this._alerts.add, this._alerts.remove),
    });

    this._settings = new Settings(this._eventEmitter, this._config);

    this._plugins = new Plugins(
      this._config,
      this._legacyMocksLoaders,
      this,
      scopedAlertsMethods("plugins", this._alerts.add, this._alerts.remove, this._alerts.rename)
    );

    this._legacyMocks = new LegacyMocks(
      this._eventEmitter,
      this._settings,
      this._legacyMocksLoaders,
      this,
      scopedAlertsMethods("legacy-mocks", this._alerts.add, this._alerts.remove)
    );

    this._server = new Server(
      this._eventEmitter,
      this._settings,
      this._legacyMocks,
      this,
      scopedAlertsMethods("server", this._alerts.add, this._alerts.remove)
    );

    // TODO, rename into eventsOrchestrator, convert into a function
    this._orchestrator = new Orchestrator(this._eventEmitter, this._legacyMocks, this._server);

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

  async init(options) {
    if (this._inited) {
      return Promise.resolve();
    }
    await this._config.init(options);
    this._inited = true;
    // Register plugins, let them add their custom settings
    await this._plugins.register();
    // Init settings, read command line arguments, etc.
    await this._settings.init(this._config.options);
    // Settings are ready, init all
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

  addFixturesHandler(Handler) {
    return this._legacyMocks.addFixturesHandler(Handler);
  }

  // Listeners

  onChangeLegacyMocks(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(CHANGE_LEGACY_MOCKS, cb);
    };
    this._eventEmitter.on(CHANGE_LEGACY_MOCKS, cb);
    return removeCallback;
  }

  onChangeSettings(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(CHANGE_SETTINGS, cb);
    };
    this._eventEmitter.on(CHANGE_SETTINGS, cb);
    return removeCallback;
  }

  onChangeAlerts(cb) {
    const removeCallback = () => {
      this._eventEmitter.removeListener(CHANGE_ALERTS, cb);
    };
    this._eventEmitter.on(CHANGE_ALERTS, cb);
    return removeCallback;
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

  // TODO, deprecate
  get serverError() {
    return this._server.error;
  }

  // Expose child objects needed

  get alerts() {
    return this._alerts.values;
  }

  get settings() {
    return this._settings;
  }

  get behaviors() {
    return this._legacyMocks.behaviors;
  }

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
