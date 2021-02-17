/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const isPromise = require("is-promise");
const { isObject, isFunction } = require("lodash");

const tracer = require("../tracer");

// FilesLoader built-in plugin
const FilesLoaderLegacy = require("./files-loader-legacy/FilesLoaderLegacy");
const FilesLoader = require("./files-loader/FilesLoader");

const { scopedAlertsMethods } = require("../support/helpers");

class Plugins {
  constructor(
    {
      addAlert,
      removeAlerts,
      renameAlerts,
      createLegacyMocksLoader,
      createMocksLoader,
      createRoutesLoader,
    },
    core
  ) {
    this._addAlert = addAlert;
    this._removeAlerts = removeAlerts;
    this._renameAlerts = renameAlerts;
    this._createMocksLoader = createMocksLoader;
    this._createRoutesLoader = createRoutesLoader;
    this._createLegacyMocksLoader = createLegacyMocksLoader;
    this._core = core;
    this._pluginsInstances = [];
    this._pluginsMethods = [];
    this._pluginsRegistered = 0;
    this._pluginsInitialized = 0;
    this._pluginsStarted = 0;
    this._pluginsStopped = 0;
  }

  register(plugins = []) {
    this._plugins = plugins;
    this._plugins.unshift(FilesLoader);
    this._plugins.unshift(FilesLoaderLegacy);
    return this._registerPlugins().then(() => {
      tracer.verbose(`Registered ${this._pluginsRegistered} plugins without errors`);
      return Promise.resolve();
    });
  }

  init() {
    this._removeAlerts("init");
    return this._initPlugins().then(() => {
      tracer.verbose(`Initializated ${this._pluginsInitialized} plugins without errors`);
      return Promise.resolve();
    });
  }

  start() {
    this._removeAlerts("start");
    return this._startPlugins().then(() => {
      tracer.verbose(`Started ${this._pluginsStarted} plugins without errors`);
      return Promise.resolve();
    });
  }

  stop() {
    this._removeAlerts("stop");
    return this._stopPlugins().then(() => {
      tracer.verbose(`Stopped ${this._pluginsStopped} plugins without errors`);
      return Promise.resolve();
    });
  }

  pluginDisplayName(index) {
    return (this._pluginsInstances[index] && this._pluginsInstances[index].displayName) || index;
  }

  _catchRegisterError(error, index) {
    const pluginDisplayName = this.pluginDisplayName(index);
    this._addAlert(
      `register:${pluginDisplayName}`,
      `Error registering plugin "${pluginDisplayName}"`,
      error
    );
    return {};
  }

  _registerPlugin(Plugin, pluginMethods, pluginIndex) {
    let pluginInstance;
    if (isObject(Plugin) && !isFunction(Plugin)) {
      pluginInstance = Plugin;
      this._pluginsRegistered++;
    } else {
      try {
        pluginInstance = new Plugin(this._core, pluginMethods);
        this._pluginsRegistered++;
      } catch (error) {
        if (error.message.includes("is not a constructor")) {
          try {
            const pluginFunc = Plugin;
            pluginInstance = pluginFunc(this._core, pluginMethods) || {};
            this._pluginsRegistered++;
          } catch (err) {
            return this._catchRegisterError(err, pluginIndex);
          }
        } else {
          return this._catchRegisterError(error, pluginIndex);
        }
      }
    }
    if (typeof pluginInstance.register === "function") {
      try {
        pluginInstance.register(this._core, pluginMethods);
      } catch (error) {
        this._catchRegisterError(error, pluginIndex);
        this._pluginsRegistered = this._pluginsRegistered - 1;
      }
    }
    return pluginInstance;
  }

  _registerPlugins(pluginIndex = 0) {
    if (pluginIndex === this._plugins.length) {
      return Promise.resolve();
    }
    const loadLegacyMocks = this._createLegacyMocksLoader();
    const loadMocks = this._createMocksLoader();
    const loadRoutes = this._createRoutesLoader();
    const pluginMethods = {
      loadLegacyMocks,
      loadMocks,
      loadRoutes,
      ...scopedAlertsMethods(
        () => this.pluginDisplayName(pluginIndex),
        this._addAlert,
        this._removeAlerts,
        this._renameAlerts
      ),
    };
    this._pluginsMethods.push(pluginMethods);
    const plugin = this._registerPlugin(this._plugins[pluginIndex], pluginMethods, pluginIndex);
    this._pluginsInstances.push(plugin);
    return this._registerPlugins(pluginIndex + 1);
  }

  _catchInitError(error, index) {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    const pluginDisplayName = this.pluginDisplayName(index);
    this._addAlert(
      `init:${pluginDisplayName}`,
      `Error initializating plugin "${pluginDisplayName}"`,
      error
    );
    tracer.debug(error.toString());
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
    const pluginDisplayName = this.pluginDisplayName(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].init) {
      this._pluginsInitialized = this._pluginsInitialized - 1;
      this._addAlert(
        `init:${pluginDisplayName}`,
        `Plugin "${pluginDisplayName}" has not init method`
      );
      return initNextPlugin();
    }
    tracer.debug(`Initializing plugin "${pluginDisplayName}"`);
    let pluginInit;
    try {
      pluginInit = this._pluginsInstances[pluginIndex].init(
        this._core,
        this._pluginsMethods[pluginIndex]
      );
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
    const pluginDisplayName = this.pluginDisplayName(index);
    this._addAlert(
      `start:${pluginDisplayName}`,
      `Error starting plugin "${pluginDisplayName}"`,
      error
    );
    tracer.debug(error.toString());
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
    const pluginDisplayName = this.pluginDisplayName(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].start) {
      this._pluginsStarted = this._pluginsStarted - 1;
      this._addAlert(
        `start:${pluginDisplayName}`,
        `Plugin "${pluginDisplayName}" has not start method`
      );
      return startNextPlugin();
    }
    tracer.debug(`Starting plugin "${pluginDisplayName}"`);
    let pluginStart;
    try {
      pluginStart = this._pluginsInstances[pluginIndex].start(
        this._core,
        this._pluginsMethods[pluginIndex]
      );
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
    const pluginDisplayName = this.pluginDisplayName(index);
    this._addAlert(
      `stop:${pluginDisplayName}`,
      `Error stopping plugin "${pluginDisplayName}"`,
      error
    );
    tracer.debug(error.toString());
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

    const pluginDisplayName = this.pluginDisplayName(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].stop) {
      this._pluginsStopped = this._pluginsStopped - 1;
      this._addAlert(
        `stop:${pluginDisplayName}`,
        `Plugin "${pluginDisplayName}" has not stop method`
      );
      return stopNextPlugin();
    }
    tracer.debug(`Stopping plugin "${pluginDisplayName}"`);
    let pluginStop;
    try {
      pluginStop = this._pluginsInstances[pluginIndex].stop(
        this._core,
        this._pluginsMethods[pluginIndex]
      );
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
