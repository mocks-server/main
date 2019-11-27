/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const isPromise = require("is-promise");
const { isObject, isFunction } = require("lodash");

const tracer = require("./tracer");

class Plugins {
  constructor(plugins, core) {
    this._core = core;
    this._plugins = plugins || [];
    this._pluginsInstances = [];
    this._pluginsRegistered = 0;
    this._pluginsInitialized = 0;
    this._pluginsStarted = 0;
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

  _catchRegisterError(error) {
    console.log("Error registering plugin");
    console.log(error);
    return {};
  }

  _registerPlugin(Plugin) {
    let pluginInstance;
    if (isObject(Plugin) && !isFunction(Plugin)) {
      pluginInstance = Plugin;
      this._pluginsRegistered++;
    } else {
      try {
        pluginInstance = new Plugin(this._core);
        this._pluginsRegistered++;
      } catch (error) {
        if (error.message.includes("is not a constructor")) {
          try {
            pluginInstance = Plugin(this._core) || {};
            this._pluginsRegistered++;
          } catch (error) {
            return this._catchRegisterError(error);
          }
        } else {
          return this._catchRegisterError(error);
        }
      }
    }
    if (typeof pluginInstance.register === "function") {
      try {
        pluginInstance.register(this._core);
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
    const plugin = this._registerPlugin(this._plugins[pluginIndex]);
    this._pluginsInstances.push(plugin);
    return this._registerPlugins(pluginIndex + 1);
  }

  _catchInitError(error, index) {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    tracer.error(`Error initializating plugin ${index}`);
    tracer.debug(error.toString());
    return Promise.resolve();
  }

  _initPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsInitialized++;
    tracer.debug(`Initializing plugin ${pluginIndex}`);
    const initNextPlugin = () => {
      return this._initPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].init) {
      this._pluginsInitialized = this._pluginsInitialized - 1;
      return initNextPlugin();
    }
    let pluginInit;
    try {
      pluginInit = this._pluginsInstances[pluginIndex].init(this._core);
    } catch (error) {
      console.log(error);
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
    tracer.error(`Error starting plugin ${index}`);
    tracer.debug(error.toString());
    return Promise.resolve();
  }

  _startPlugins(pluginIndex = 0) {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStarted++;
    tracer.debug(`Starting plugin ${pluginIndex}`);
    const startNextPlugin = () => {
      return this._startPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].start) {
      this._pluginsStarted = this._pluginsStarted - 1;
      return startNextPlugin();
    }
    let pluginStart;
    try {
      pluginStart = this._pluginsInstances[pluginIndex].start(this._core);
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
}

module.exports = Plugins;
