/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const isPromise = require("is-promise");
const { isObject, isFunction } = require("lodash");

const { scopedAlertsMethods } = require("../alerts/legacyHelpers");
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

function formatDeprecatedMessage(format) {
  return `Defining Plugins as ${format} is deprecated and it won't be supported in next major version. Consider migrating it to a Class Plugin: https://www.mocks-server.org/docs/plugins-developing-plugins`;
}

class Plugins {
  static get id() {
    return "plugins";
  }

  constructor(
    {
      config,
      alerts,
      logger,
      addAlert,
      removeAlerts,
      renameAlerts,
      createMocksLoader,
      createRoutesLoader,
    },
    core
  ) {
    this._config = config;
    this._logger = logger;

    [this._pluginsToRegister] = this._config.addOptions(OPTIONS);

    this._alerts = alerts;

    this._alertsRegister = this._alerts.collection("register");
    this._alertsInit = this._alerts.collection("init");
    this._alertsStart = this._alerts.collection("start");
    this._alertsStop = this._alerts.collection("stop");
    this._alertsFormat = this._alerts.collection("format");

    this._addAlert = addAlert;
    this._removeAlerts = removeAlerts;
    this._renameAlerts = renameAlerts;
    this._createMocksLoader = createMocksLoader;
    this._createRoutesLoader = createRoutesLoader;
    this._core = core;
    this._pluginsInstances = [];
    this._pluginsMethods = [];
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
    this._alertsRegister.set(pluginId, `Error registering plugin "${pluginId}"`, error);
    return {};
  }

  _registerPlugin(Plugin, pluginMethods, pluginIndex) {
    let pluginInstance,
      formatIsObject,
      formatIsFunction,
      pluginConfig,
      pluginAlerts,
      pluginLogger,
      optionsAdded = false,
      coreApi;
    const pluginOptions = { core: this._core, ...pluginMethods };
    if (isObject(Plugin) && !isFunction(Plugin)) {
      pluginInstance = Plugin;
      this._pluginsInstances.push(pluginInstance);
      this._pluginsRegistered++;
      formatIsObject = true;
    } else {
      try {
        if (Plugin.id) {
          pluginConfig = this._config.addNamespace(Plugin.id);
          pluginAlerts = this._alerts.collection(Plugin.id);
          pluginLogger = this._logger.namespace(Plugin.id);
        }
        const pluginFinalOptions = {
          ...pluginOptions,
          config: pluginConfig,
          alerts: pluginAlerts,
          logger: pluginLogger,
        };
        coreApi = new CoreApi(pluginFinalOptions);
        pluginInstance = new Plugin(coreApi);
        this._pluginsOptions.push(coreApi);
        optionsAdded = true;
        this._pluginsInstances.push(pluginInstance);
        this._pluginsRegistered++;
      } catch (error) {
        if (error.message.includes("is not a constructor")) {
          try {
            const pluginFunc = Plugin;
            pluginInstance = pluginFunc(new CoreApi(pluginOptions)) || {};
            this._pluginsInstances.push(pluginInstance);
            this._pluginsRegistered++;
            formatIsFunction = true;
          } catch (err) {
            return this._catchRegisterError(err, pluginIndex);
          }
        } else {
          return this._catchRegisterError(error, pluginIndex);
        }
      }
    }
    if (
      isFunction(pluginInstance.register) ||
      isFunction(pluginInstance.init) ||
      isFunction(pluginInstance.start) ||
      isFunction(pluginInstance.stop)
    ) {
      let pluginFinalOptions = {
        ...pluginOptions,
        config: pluginConfig,
        alerts: pluginAlerts,
        logger: pluginLogger,
      };
      if (!pluginConfig && pluginInstance.id) {
        pluginConfig = this._config.addNamespace(pluginInstance.id);
        pluginAlerts = this._alerts.collection(pluginInstance.id);
        pluginLogger = this._logger.namespace(pluginInstance.id);
        pluginFinalOptions = {
          ...pluginOptions,
          config: pluginConfig,
          alerts: pluginAlerts,
          logger: pluginLogger,
        };
        coreApi = new CoreApi(pluginFinalOptions);
        if (optionsAdded) {
          this._pluginsOptions.pop();
        }
        this._pluginsOptions.push(coreApi);
      } else {
        if (!coreApi) {
          coreApi = new CoreApi(pluginFinalOptions);
        }
        this._pluginsOptions.push(coreApi);
      }
      if (isFunction(pluginInstance.register)) {
        try {
          pluginInstance.register(coreApi);
        } catch (error) {
          this._catchRegisterError(error, pluginIndex);
          this._pluginsRegistered = this._pluginsRegistered - 1;
        }
      }
    }
    if (formatIsObject) {
      this._alertsFormat.set(this._pluginId(pluginIndex), formatDeprecatedMessage("objects"));
    }
    if (formatIsFunction) {
      this._alertsFormat.set(this._pluginId(pluginIndex), formatDeprecatedMessage("functions"));
    }
    return pluginInstance;
  }

  _registerPlugins(pluginIndex = 0) {
    if (pluginIndex === this._plugins.length) {
      return Promise.resolve();
    }
    const loadMocks = this._createMocksLoader();
    const loadRoutes = this._createRoutesLoader();
    const pluginMethods = {
      loadMocks,
      loadRoutes,
      ...scopedAlertsMethods(
        () => {
          return this._pluginId(pluginIndex);
        },
        this._addAlert,
        this._removeAlerts,
        this._renameAlerts
      ),
    };
    this._pluginsMethods.push(pluginMethods);
    this._registerPlugin(this._plugins[pluginIndex], pluginMethods, pluginIndex);
    return this._registerPlugins(pluginIndex + 1);
  }

  _catchInitError(error, index) {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    const pluginId = this._pluginId(index);
    this._alertsInit.set(pluginId, `Error initializating plugin "${pluginId}"`, error);
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
    this._logger.debug(`Initializing plugin "${pluginId}"`);
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
    this._alertsStart.set(pluginId, `Error starting plugin "${pluginId}"`, error);
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
    this._logger.debug(`Starting plugin "${pluginId}"`);
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
    this._alertsStop.set(pluginId, `Error stopping plugin "${pluginId}"`, error);
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
    this._logger.debug(`Stopping plugin "${pluginId}"`);
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
