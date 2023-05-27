/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  ConfigNamespaceInterface,
  OptionDefinition,
  GetOptionValueTypeFromDefinition,
} from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/types";
import type { ScopedCoreInterface } from "../common/types";
import type { CoreInterface } from "../Core.types";

export type PluginsOptionDefinition = OptionDefinition<PluginConstructor[], { hasDefault: true }>;

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface PluginsConfig {
      register?: GetOptionValueTypeFromDefinition<PluginsOptionDefinition, PluginConstructor[]>;
    }
    interface Config {
      plugins?: PluginsConfig;
    }
  }
}

/** Options for creating a plugins interface */
export interface PluginsOptions {
  /** Plugins config object */
  config: ConfigNamespaceInterface;
  /** Plugins logger object */
  logger: LoggerInterface;
  /** Plugins scoped alerts */
  alerts: AlertsInterface;
}

/** Creates a Plugins interface */
export interface PluginsConstructor {
  /**
   * Plugins class static id
   */
  get id(): string;
  /**
   * Creates a plugins interface
   * @param options - Plugins options {@link PluginsOptions}
   * @param core - Mocks Server root core interface {@link CoreInterface}
   * @returns Plugins interface {@link PluginsInterface}.
   * @example const plugins = new Plugins({ config, logger });
   */
  new (options: PluginsOptions, core: CoreInterface): PluginsInterface;
}

/** Plugins interface */
export interface PluginsInterface {
  /**
   * Register plugins
   * @example await plugins.register();
   */
  register(): Promise<void>;

  /**
   * Initialize plugins, by calling to their init method
   * @example await plugins.init();
   */
  init(): Promise<void>;

  /**
   * Start plugins, by calling to their stop method
   * @example await plugins.start();
   */
  start(): Promise<void>;

  /**
   * Stop plugins, by calling to their stop method
   * @example await plugins.stop();
   */
  stop(): Promise<void>;
}

export type PluginId = string;

/** Expected constructor function in plugins */
export interface PluginConstructor {
  /**
   * Plugin static id. Used for logging purposes, and to create scoped alerts, config and logger for the plugin
   */
  get id(): PluginId;
  /**
   * Register plugin configuration, etc. https://www.mocks-server.org/docs/plugins/development/#constructorcore
   * @param core - Mocks Server core with scoped config, alerts and logger {@link ScopedCoreInterface}
   * @example await new Plugin(core);
   * @returns Plugin interface {@link PluginInterface}.
   */
  new (core: ScopedCoreInterface): PluginInterface;
}

/** Plugin method used by Mocks Server to manage its lifecycle */
export interface PluginLifeCycleMethod {
  (): Promise<void>;
}

/** Common Interface to be implemented by plugins */
export interface PluginInterface {
  /**
   * Register plugin configuration, etc. Use it if you need to make async stuff for registering your settings. Otherwise, use the constructor. https://www.mocks-server.org/docs/plugins/development/#constructorcore
   * @example await plugin.register();
   */
  register?: PluginLifeCycleMethod;
  /**
   * Init the plugin. Here you should read options, add listeners to core events, etc. https://www.mocks-server.org/docs/plugins/development/#initcore
   * @example await plugin.init();
   */
  init?: PluginLifeCycleMethod;
  /**
   * Start the plugin. Here you should start the plugin processes in case there are. https://www.mocks-server.org/docs/plugins/development/#startcore
   * @example await plugin.start();
   */
  start?: PluginLifeCycleMethod;
  /**
   * Stop the plugin. Here you should stop all the plugin processes that you started in the start method. https://www.mocks-server.org/docs/plugins/development/#stopcore
   * @example await plugin.stop();
   */
  stop?: PluginLifeCycleMethod;
}

export interface PluginWithError extends PluginInterface {} // eslint-disable-line @typescript-eslint/no-empty-interface
