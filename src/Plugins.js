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
    this._pluginsInitialized = this._pluginsInitialized - 1;
    tracer.error("Error initializating plugin");
    tracer.debug(error);
    return Promise.resolve();
  }

  _catchStartError(error) {
    this._pluginsStarted = this._pluginsStarted - 1;
    tracer.error("Error starting plugin");
    tracer.debug(error);
    return Promise.resolve();
  }

  _registerPluginFunction(Plugin) {
    let pluginInstance;
    try {
      pluginInstance = Plugin(this._core);
      this._pluginsRegistered++;
    } catch (error) {
      return this._catchRegisterError(error);
    }
    return pluginInstance;
  }

  _registerPlugin(Plugin) {
    if (isObject(Plugin) && !isFunction(Plugin)) {
      this._pluginsRegistered++;
      return Plugin;
    }
    let pluginInstance;
    try {
      pluginInstance = new Plugin(this._core);
      this._pluginsRegistered++;
    } catch (error) {
      if (error.message.includes("is not a constructor")) {
        return this._registerPluginFunction(Plugin);
      } else {
        return this._catchRegisterError(error);
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
      pluginInit = this._pluginsInstances[pluginIndex].init();
    } catch (error) {
      return this._catchInitError(error).then(initNextPlugin);
    }

    if (!isPromise(pluginInit)) {
      return initNextPlugin();
    }
    return pluginInit.catch(this._catchInitError).then(initNextPlugin);
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
      pluginStart = this._pluginsInstances[pluginIndex].start();
    } catch (error) {
      return this._catchStartError(error).then(startNextPlugin);
    }

    if (!isPromise(pluginStart)) {
      return startNextPlugin();
    }
    return pluginStart.catch(this._catchStartError).then(startNextPlugin);
  }
}

module.exports = Plugins;
