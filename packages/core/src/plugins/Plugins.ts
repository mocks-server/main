/*
Copyright 2019-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { OptionProperties, NamespaceInterface, OptionInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import isPromise from "is-promise";
import { isFunction } from "lodash";

import type { AlertsInterface } from "../alerts/Alerts.types";
import { ScopedCore } from "../common/ScopedCore";
import type { ScopedCoreInterface } from "../common/ScopedCore.types";
import type { CoreInterface } from "../Core.types";

import type {
  PluginsOptions,
  PluginsConstructor,
  PluginsInterface,
  PluginConstructor,
  PluginInterface,
  PluginId,
  PluginWithError,
  PluginLifeCycleMethod,
} from "./Plugins.types";

const OPTIONS: OptionProperties[] = [
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

export const Plugins: PluginsConstructor = class Plugins implements PluginsInterface {
  private _config: NamespaceInterface;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _pluginsToRegister: OptionInterface;
  private _alertsRegister: AlertsInterface;
  private _alertsInit: AlertsInterface;
  private _alertsStart: AlertsInterface;
  private _alertsStop: AlertsInterface;
  private _alertsFormat: AlertsInterface;
  private _core: CoreInterface;
  private _pluginsInstances: PluginInterface[];
  private _pluginsScopedCores: ScopedCoreInterface[];
  private _pluginsRegistered: number;
  private _pluginsInitialized: number;
  private _pluginsStarted: number;
  private _pluginsStopped: number;
  private _plugins: PluginConstructor[];

  static get id(): string {
    return "plugins";
  }

  constructor({ config, alerts, logger }: PluginsOptions, core: CoreInterface) {
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
    this._pluginsScopedCores = [];
    this._pluginsRegistered = 0;
    this._pluginsInitialized = 0;
    this._pluginsStarted = 0;
    this._pluginsStopped = 0;
  }

  public async register(): Promise<void> {
    this._alertsRegister.clean();
    this._plugins = this._pluginsToRegister.value;
    await this._registerPlugins();
    this._logger.verbose(`Registered ${this._pluginsRegistered} plugins without errors`);
  }

  public async init(): Promise<void> {
    this._alertsInit.clean();
    this._logger.verbose(`Initializing plugins`);
    await this._initPlugins();
    this._logger.verbose(`Initialized ${this._pluginsInitialized} plugins without errors`);
  }

  public async start(): Promise<void> {
    this._alertsStart.clean();
    await this._startPlugins();
    this._logger.verbose(`Started ${this._pluginsStarted} plugins without errors`);
  }

  public async stop(): Promise<void> {
    this._alertsStop.clean();
    await this._stopPlugins();
    this._logger.verbose(`Stopped ${this._pluginsStopped} plugins without errors`);
  }

  private _pluginId(index: number): PluginId {
    const plugin = this._pluginsInstances[index];
    if (!plugin) {
      return `${index}`;
    }
    const pluginConstructor = plugin.constructor as PluginConstructor;
    if (pluginConstructor.id) {
      return pluginConstructor.id;
    }
    return plugin.id || `${index}`;
  }

  private _catchRegisterError(error: Error, index: number): PluginWithError {
    const pluginId = this._pluginId(index);
    this._alertsRegister.set(pluginId, `Error registering plugin '${pluginId}'`, error);
    return {};
  }

  private async _registerPlugin(
    Plugin: PluginConstructor,
    pluginIndex: number
  ): Promise<PluginInterface> {
    let pluginInstance,
      pluginConfig: NamespaceInterface | undefined,
      pluginAlerts,
      pluginLogger,
      coreApi;
    const pluginCoreOptions = { core: this._core };
    try {
      // TODO, throw an error if plugin has no id. legacy. Require config, logger and alerts in ScopedCore
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
      coreApi = new ScopedCore(pluginCoreFinalOptions);
      pluginInstance = new Plugin(coreApi);
      this._pluginsScopedCores.push(coreApi);
      this._pluginsInstances.push(pluginInstance);
      this._pluginsRegistered++;
    } catch (error) {
      return this._catchRegisterError(error as Error, pluginIndex);
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
        coreApi = new ScopedCore(pluginCoreFinalOptions);
        this._pluginsScopedCores.pop();
        this._pluginsScopedCores.push(coreApi);
      } else {
        this._pluginsScopedCores.push(coreApi);
      }

      if (isFunction(pluginInstance.register)) {
        try {
          await pluginInstance.register(coreApi);
        } catch (error) {
          this._pluginsRegistered = this._pluginsRegistered - 1;
          return this._catchRegisterError(error as Error, pluginIndex);
        }
      }
    }
    return pluginInstance;
  }

  private async _registerPlugins(pluginIndex = 0): Promise<void> {
    if (pluginIndex === this._plugins.length) {
      return Promise.resolve();
    }
    await this._registerPlugin(this._plugins[pluginIndex], pluginIndex);
    return this._registerPlugins(pluginIndex + 1);
  }

  private _catchInitError(error: Error, index: number): Promise<void> {
    this._pluginsInitialized = this._pluginsInitialized - 1;
    const pluginId = this._pluginId(index);
    this._alertsInit.set(pluginId, `Error initializing plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  private _initPlugins(pluginIndex = 0): Promise<void> {
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
      this._logger.debug(`Plugin '${pluginId}' has no init method. Skipping initialization`);
      return initNextPlugin();
    }

    this._logger.debug(`Initializing plugin '${pluginId}'`);
    let pluginInit;
    try {
      const pluginInitMethod = this._pluginsInstances[pluginIndex].init as PluginLifeCycleMethod;
      pluginInit = pluginInitMethod.bind(this._pluginsInstances[pluginIndex])(
        this._pluginsScopedCores[pluginIndex]
      );
    } catch (error) {
      return this._catchInitError(error as Error, pluginIndex).then(initNextPlugin);
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

  private _catchStartError(error: Error, index: number): Promise<void> {
    this._pluginsStarted = this._pluginsStarted - 1;
    const pluginId = this._pluginId(index);
    this._alertsStart.set(pluginId, `Error starting plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  private _startPlugins(pluginIndex = 0): Promise<void> {
    if (pluginIndex === this._pluginsInstances.length) {
      return Promise.resolve();
    }
    this._pluginsStarted++;
    const startNextPlugin = () => {
      return this._startPlugins(pluginIndex + 1);
    };
    const pluginId = this._pluginId(pluginIndex);
    if (!this._pluginsInstances[pluginIndex].start) {
      this._logger.debug(`Plugin '${pluginId}' has no start method. Skipping start`);
      this._pluginsStarted = this._pluginsStarted - 1;
      return startNextPlugin();
    }

    this._logger.debug(`Starting plugin '${pluginId}'`);
    let pluginStart;
    try {
      const pluginStartMethod = this._pluginsInstances[pluginIndex].start as PluginLifeCycleMethod;
      pluginStart = pluginStartMethod.bind(this._pluginsInstances[pluginIndex])(
        this._pluginsScopedCores[pluginIndex]
      );
    } catch (error) {
      return this._catchStartError(error as Error, pluginIndex).then(startNextPlugin);
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

  private _catchStopError(error: Error, index: number): Promise<void> {
    this._pluginsStopped = this._pluginsStopped - 1;
    const pluginId = this._pluginId(index);
    this._alertsStop.set(pluginId, `Error stopping plugin '${pluginId}'`, error);
    this._logger.debug(error.toString());
    return Promise.resolve();
  }

  private _stopPlugins(pluginIndex = 0): Promise<void> {
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
      this._logger.debug(`Plugin '${pluginId}' has no stop method. Skipping stop`);
      return stopNextPlugin();
    }

    this._logger.debug(`Stopping plugin '${pluginId}'`);
    let pluginStop;
    try {
      const pluginStopMethod = this._pluginsInstances[pluginIndex].stop as PluginLifeCycleMethod;
      pluginStop = pluginStopMethod.bind(this._pluginsInstances[pluginIndex])(
        this._pluginsScopedCores[pluginIndex]
      );
    } catch (error) {
      return this._catchStopError(error as Error, pluginIndex).then(stopNextPlugin);
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
};
