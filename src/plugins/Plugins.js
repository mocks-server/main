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
const FilesLoader = require("./FilesLoader");

class Plugins {
  constructor(plugins, loaders, core) {
    this._core = core;
    this._loaders = loaders;
    this._plugins = plugins || [];
    this._pluginsInstances = [];
    this._pluginsMethods = [];
    this._pluginsRegistered = 0;
    this._pluginsInitialized = 0;
    this._pluginsStarted = 0;
    this._pluginsStopped = 0;

    this._plugins.push(FilesLoader);
  }

  register() {
    return this._registerPlugins().then(() => {
      tracer.verbose(`Registered ${this._pluginsRegistered} plugins without errors`);
      return Promise.resolve();
    });
  }

  init() {
    return this._initPlugins().then(() => {
      tracer.verbose(`Initializated ${this._pluginsInitialized} plugins without errors`);
      return Promise.resolve();
    });
  }

  start() {
    return this._startPlugins().then(() => {
      tracer.verbose(`Started ${this._pluginsStarted} plugins without errors`);
      return Promise.resolve();
    });
  }

  stop() {
    return this._stopPlugins().then(() => {
      tracer.verbose(`Stopped ${this._pluginsStopped} plugins without errors`);
      return Promise.resolve();
    });
  }

  pluginDisplayName(index) {
    return this._pluginsInstances[index].displayName || index;
  }

  _catchRegisterError(error) {
    console.log("Error registering plugin");
    console.log(error);
    return {};
  }

  _registerPlugin(Plugin, pluginMethods) {
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
            return this._catchRegisterError(err);
          }
        } else {
          return this._catchRegisterError(error);
        }
      }
    }
    if (typeof pluginInstance.register === "function") {
      try {
        pluginInstance.register(this._core, pluginMethods);
      } catch (error) {
        this._catchRegisterError(error);
        this._pluginsRegistered = this._pluginsRegistered - 1;
      }
    }
    return pluginInstance;
  }

  _registerPlugins(pluginIndex = 0) {
    if (pluginIndex === this._plugins.length) {
      return Promise.resolve();
    }
    const loadMocks = this._loaders.new();
    const pluginMethods = {
      loadMocks
    };
    this._pluginsMethods.push(pluginMethods);
    const plugin = this._registerPlugin(this._plugins[pluginIndex], pluginMethods);
    this._pluginsInstances.push(plugin);
    return this._registerPlugins(pluginIndex + 1);
  }

  _catchInitError(error, index) {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    tracer.error(`Error initializating plugin ${this.pluginDisplayName(index)}`);
    tracer.debug(error.toString());
    return Promise.resolve();
  }

  _initPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsInitialized++;
    tracer.debug(`Initializing plugin "${this.pluginDisplayName(pluginIndex)}"`);
    const initNextPlugin = () => {
      return this._initPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].init) {
      this._pluginsInitialized = this._pluginsInitialized - 1;
      return initNextPlugin();
    }
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
      .catch(error => {
        return this._catchInitError(error, pluginIndex);
      })
      .then(initNextPlugin);
  }

  _catchStartError(error, index) {
    this._pluginsStarted = this._pluginsStarted - 1;
    tracer.error(`Error starting plugin "${this.pluginDisplayName(index)}"`);
    tracer.debug(error.toString());
    return Promise.resolve();
  }

  _startPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStarted++;
    tracer.debug(`Starting plugin "${this.pluginDisplayName(pluginIndex)}"`);
    const startNextPlugin = () => {
      return this._startPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].start) {
      this._pluginsStarted = this._pluginsStarted - 1;
      return startNextPlugin();
    }
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
      .catch(error => {
        return this._catchStartError(error, pluginIndex);
      })
      .then(startNextPlugin);
  }

  _catchStopError(error, index) {
    this._pluginsStopped = this._pluginsStopped - 1;
    tracer.error(`Error stopping plugin "${this.pluginDisplayName(index)}"`);
    tracer.debug(error.toString());
    return Promise.resolve();
  }

  _stopPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStopped++;
    tracer.debug(`Stopping plugin "${this.pluginDisplayName(pluginIndex)}"`);
    const stopNextPlugin = () => {
      return this._stopPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].stop) {
      this._pluginsStopped = this._pluginsStopped - 1;
      return stopNextPlugin();
    }
    let pluginStop;
    try {
      pluginStop = this._pluginsInstances[pluginIndex].stop();
    } catch (error) {
      return this._catchStopError(error, pluginIndex).then(stopNextPlugin);
    }

    if (!isPromise(pluginStop)) {
      return stopNextPlugin();
    }
    return pluginStop
      .catch(error => {
        return this._catchStopError(error, pluginIndex);
      })
      .then(stopNextPlugin);
  }
}

module.exports = Plugins;
