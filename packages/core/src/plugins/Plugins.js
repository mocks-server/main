/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const isPromise = require("is-promise");
const { isFunction } = require("lodash");

const CoreApi = require("../common/CoreApi");

const OPTIONS = [
  {
    description: "Plugins to be registered",
    name: "register",
    type: "array",
    default: [],
    extraData: {
      scaffold: {
        value: [],
      },
    },
  },
];

class Plugins {
  static get id() {
    return "plugins";
  }

  constructor({ config, alerts, logger }, core) {
    this._config = config;
    this._logger = logger;

    [this._pluginsToRegister] = this._config.addOptions(OPTIONS);

    this._alerts = alerts;

    this._alertsRegister = this._alerts.collection("register");
    this._alertsInit = this._alerts.collection("init");
    this._alertsStart = this._alerts.collection("start");
    this._alertsStop = this._alerts.collection("stop");
    this._alertsFormat = this._alerts.collection("format");

    this._core = core;
    this._pluginsInstances = [];
    this._pluginsOptions = [];
    this._pluginsRegistered = 0;
    this._pluginsInitialized = 0;
    this._pluginsStarted = 0;
    this._pluginsStopped = 0;
  }

  register() {
    this._alertsRegister.clean();
    this._plugins = this._pluginsToRegister.value;
    return this._registerPlugins().then(() => {
      this._logger.verbose(`Registered ${this._pluginsRegistered} plugins without errors`);
      return Promise.resolve();
    });
  }

  init() {
    this._alertsInit.clean();
    return this._initPlugins().then(() => {
      this._logger.verbose(`Initializated ${this._pluginsInitialized} plugins without errors`);
      return Promise.resolve();
    });
  }

  start() {
    this._alertsStart.clean();
    return this._startPlugins().then(() => {
      this._logger.verbose(`Started ${this._pluginsStarted} plugins without errors`);
      return Promise.resolve();
    });
  }

  stop() {
    this._alertsStop.clean();
    return this._stopPlugins().then(() => {
      this._logger.verbose(`Stopped ${this._pluginsStopped} plugins without errors`);
      return Promise.resolve();
    });
  }

  _pluginId(index) {
    const plugin = this._pluginsInstances[index];
    if (!plugin) {
      return index;
    }
    if (plugin.constructor.id) {
      return plugin.constructor.id;
    }
    return plugin.id || index;
  }

  _catchRegisterError(error, index) {
    const pluginId = this._pluginId(index);
    this._alertsRegister.set(pluginId, `Error registering plugin '${pluginId}'`, error);
    return {};
  }

  _registerPlugin(Plugin, pluginIndex) {
    let pluginInstance, pluginConfig, pluginAlerts, pluginLogger, coreApi;
    const pluginCoreOptions = { core: this._core };
    try {
      // TODO, throw an error if plugin has no id. legacy
      if (Plugin.id) {
        pluginConfig = this._config.addNamespace(Plugin.id);
        pluginAlerts = this._alerts.collection(Plugin.id);
        pluginLogger = this._logger.namespace(Plugin.id);
      } else {
        this._alertsFormat.set(
          this._pluginId(pluginIndex),
          "Plugins must have a static id property"
        );
      }
      const pluginCoreFinalOptions = {
        ...pluginCoreOptions,
        config: pluginConfig,
        alerts: pluginAlerts,
        logger: pluginLogger,
      };
      coreApi = new CoreApi(pluginCoreFinalOptions);
      pluginInstance = new Plugin(coreApi);
      this._pluginsOptions.push(coreApi);
      this._pluginsInstances.push(pluginInstance);
      this._pluginsRegistered++;
    } catch (error) {
      return this._catchRegisterError(error, pluginIndex);
    }
    if (
      isFunction(pluginInstance.register) ||
      isFunction(pluginInstance.init) ||
      isFunction(pluginInstance.start) ||
      isFunction(pluginInstance.stop)
    ) {
      let pluginCoreFinalOptions = {
        ...pluginCoreOptions,
        config: pluginConfig,
        alerts: pluginAlerts,
        logger: pluginLogger,
      };
      // If plugin has not static id, custom core API is passed only to methods
      // Legacy, remove when plugin static id is mandatory
      if (!pluginConfig && pluginInstance.id) {
        pluginConfig = this._config.addNamespace(pluginInstance.id);
        pluginAlerts = this._alerts.collection(pluginInstance.id);
        pluginLogger = this._logger.namespace(pluginInstance.id);
        pluginCoreFinalOptions = {
          ...pluginCoreOptions,
          config: pluginConfig,
          alerts: pluginAlerts,
          logger: pluginLogger,
        };
        coreApi = new CoreApi(pluginCoreFinalOptions);
        this._pluginsOptions.pop();
        this._pluginsOptions.push(coreApi);
      } else {
        this._pluginsOptions.push(coreApi);
      }
      // TODO, deprecate register method. It is duplicated with the constructor. Legacy
      if (isFunction(pluginInstance.register)) {
        try {
          pluginInstance.register(coreApi);
        } catch (error) {
          this._pluginsRegistered = this._pluginsRegistered - 1;
          return this._catchRegisterError(error, pluginIndex);
        }
      }
    }
    return pluginInstance;
  }

  _registerPlugins(pluginIndex = 0) {
    if (pluginIndex === this._plugins.length) {
      return Promise.resolve();
    }
    this._registerPlugin(this._plugins[pluginIndex], pluginIndex);
    return this._registerPlugins(pluginIndex + 1);
  }

  _catchInitError(error, index) {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    const pluginId = this._pluginId(index);
    this._alertsInit.set(pluginId, `Error initializating plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  _initPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsInitialized++;
    const initNextPlugin = () => {
      return this._initPlugins(pluginIndex + 1);
    };
    const pluginId = this._pluginId(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].init) {
      this._pluginsInitialized = this._pluginsInitialized - 1;
      return initNextPlugin();
    }
    this._logger.debug(`Initializing plugin '${pluginId}'`);
    let pluginInit;
    try {
      pluginInit = this._pluginsInstances[pluginIndex].init(this._pluginsOptions[pluginIndex]);
    } catch (error) {
      return this._catchInitError(error, pluginIndex).then(initNextPlugin);
    }

    if (!isPromise(pluginInit)) {
      return initNextPlugin();
    }
    return pluginInit
      .catch((error) => {
        return this._catchInitError(error, pluginIndex);
      })
      .then(initNextPlugin);
  }

  _catchStartError(error, index) {
    this._pluginsStarted = this._pluginsStarted - 1;
    const pluginId = this._pluginId(index);
    this._alertsStart.set(pluginId, `Error starting plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  _startPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStarted++;
    const startNextPlugin = () => {
      return this._startPlugins(pluginIndex + 1);
    };
    const pluginId = this._pluginId(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].start) {
      this._pluginsStarted = this._pluginsStarted - 1;
      return startNextPlugin();
    }
    this._logger.debug(`Starting plugin '${pluginId}'`);
    let pluginStart;
    try {
      pluginStart = this._pluginsInstances[pluginIndex].start(this._pluginsOptions[pluginIndex]);
    } catch (error) {
      return this._catchStartError(error, pluginIndex).then(startNextPlugin);
    }

    if (!isPromise(pluginStart)) {
      return startNextPlugin();
    }
    return pluginStart
      .catch((error) => {
        return this._catchStartError(error, pluginIndex);
      })
      .then(startNextPlugin);
  }

  _catchStopError(error, index) {
    this._pluginsStopped = this._pluginsStopped - 1;
    const pluginId = this._pluginId(index);
    this._alertsStop.set(pluginId, `Error stopping plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  _stopPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStopped++;
    const stopNextPlugin = () => {
      return this._stopPlugins(pluginIndex + 1);
    };

    const pluginId = this._pluginId(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].stop) {
      this._pluginsStopped = this._pluginsStopped - 1;
      return stopNextPlugin();
    }
    this._logger.debug(`Stopping plugin '${pluginId}'`);
    let pluginStop;
    try {
      pluginStop = this._pluginsInstances[pluginIndex].stop(this._pluginsOptions[pluginIndex]);
    } catch (error) {
      return this._catchStopError(error, pluginIndex).then(stopNextPlugin);
    }

    if (!isPromise(pluginStop)) {
      return stopNextPlugin();
    }
    return pluginStop
      .catch((error) => {
        return this._catchStopError(error, pluginIndex);
      })
      .then(stopNextPlugin);
  }
}

module.exports = Plugins;
