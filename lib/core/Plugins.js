/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const isPromise = require("is-promise");
const { isFunction } = require("lodash");

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
      tracer.verbose(`Registered ${this._pluginsRegistered} plugins`);
      return Promise.resolve();
    });
  }

  init() {
    return this._initPlugins().then(() => {
      tracer.verbose(`Initializated ${this._pluginsInitialized} plugins`);
      return Promise.resolve();
    });
  }

  start() {
    return this._startPlugins().then(() => {
      tracer.verbose(`Started ${this._pluginsStarted} plugins`);
      return Promise.resolve();
    });
  }

  _catchRegisterError(error) {
    console.log("Error registering plugin");
    console.log(error);
    return {};
  }

  _catchInitError(error) {
    tracer.error("Error initializating plugin");
    tracer.debug(error);
    return Promise.resolve();
  }

  _catchStartError(error) {
    tracer.error("Error starting plugin");
    tracer.debug(error);
    return Promise.resolve();
  }

  _createPluginFunction(Plugin) {
    let pluginInstance;
    try {
      pluginInstance = Plugin(this._core);
    } catch (error) {
      return this._catchCreateError(error);
    }
    return pluginInstance;
  }

  _createPlugin(Plugin) {
    if (!isFunction(Plugin)) {
      return Plugin;
    }
    let pluginInstance;
    try {
      pluginInstance = new Plugin(this._core);
    } catch (error) {
      if (error.message.includes("is not a constructor")) {
        return this._createPluginFunction(Plugin);
      } else {
        return this._catchCreateError(error);
      }
    }
    return pluginInstance;
  }

  _registerPlugins(pluginIndex = 0) {
    if (!this._plugins[pluginIndex]) {
      return Promise.resolve();
    }
    const plugin = this._createPlugin(this._plugins[pluginIndex]);
    this._pluginsInstances.push(plugin);
    return this._registerPlugins(pluginIndex + 1);
  }

  _initPlugins(pluginIndex = 0) {
    if (!this._pluginsInstances[pluginIndex]) {
      return Promise.resolve();
    }
    tracer.debug(`Initializing plugin ${pluginIndex}`);
    const initNextPlugin = () => {
      return this._initPlugins(pluginIndex + 1);
    };

    if (!this._pluginsInstances[pluginIndex].init) {
      return initNextPlugin();
    }
    let pluginInit;
    try {
      pluginInit = this._pluginsInstances[pluginIndex].init();
    } catch (error) {
      return this._catchInitError(error);
    }

    if (!isPromise(pluginInit)) {
      this._pluginsInitialized++;
      return Promise.resolve();
    }
    return pluginInit
      .then(() => {
        this._pluginsInitialized++;
        return Promise.resolve();
      })
      .then(initNextPlugin)
      .catch(this._catchInitError);
  }

  _startPlugins(pluginIndex = 0) {
    if (!this._pluginsInstances[pluginIndex]) {
      return Promise.resolve();
    }
    tracer.debug(`Starting plugin ${pluginIndex}`);
    const startNextPlugin = () => {
      return this._startPlugins(pluginIndex + 1);
    };
    if (!this._pluginsInstances[pluginIndex].start) {
      return startNextPlugin();
    }
    let pluginStart;
    try {
      pluginStart = this._pluginsInstances[pluginIndex].start();
    } catch (error) {
      return this._catchStartError(error);
    }
    if (!isPromise(pluginStart)) {
      this._pluginsStarted++;
      return Promise.resolve();
    }
    return pluginStart
      .then(() => {
        this._pluginsStarted++;
        return Promise.resolve();
      })
      .then(startNextPlugin)
      .catch(this._catchStartError);
  }
}

module.exports = Plugins;
