/*
Copyright 2019-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import EventEmitter from "events";
import path from "path";

import {
  Config,
  ConfigInterface,
  ConfigurationObject,
  NamespaceInterface,
  OptionInterface,
  OptionProperties,
} from "@mocks-server/config";
import { Logger, LoggerInterface, LogLevel } from "@mocks-server/logger";
import deepMerge from "deepmerge";
import { readJsonSync } from "fs-extra";

import { Alerts } from "./alerts/Alerts";
import type { AlertsInterface } from "./alerts/Alerts.types";
import { CHANGE_MOCK, CHANGE_ALERTS } from "./common/Events";
import { arrayMerge } from "./common/Helpers";
import type { CoreInterface, CoreConstructor, CoreAdvancedOptions } from "./Core.types";
import { Files } from "./files/Files";
import type { FilesInterface } from "./files/Files.types";
import { Mock } from "./mock/Mock";
import type { MockInterface } from "./mock/Mock.types";
import { Plugins } from "./plugins/Plugins";
import type { PluginsInterface } from "./plugins/Plugins.types";
import { Scaffold } from "./scaffold/Scaffold";
import type { ScaffoldInterface } from "./scaffold/Scaffold.types";
import { Server } from "./server/Server";
import type { ServerInterface } from "./server/Server.types";
import { UpdateNotifier } from "./update-notifier/UpdateNotifier";
import type { UpdateNotifierInterface } from "./update-notifier/UpdateNotifier.types";
import { VariantHandlers } from "./variant-handlers/VariantHandlers";
import type { VariantHandlersInterface } from "./variant-handlers/VariantHandlers.types";

const MODULE_NAME = "mocks";

const ROOT_OPTIONS: OptionProperties[] = [
  {
    description: "Log level. Can be one of silly, debug, verbose, info, warn or error",
    name: "log",
    type: "string",
    default: "info",
  },
];

export const Core: CoreConstructor = class Core implements CoreInterface {
  private _programmaticConfig: ConfigurationObject;
  private _eventEmitter: EventEmitter;
  private _logger: LoggerInterface;
  private _configLogger: LoggerInterface;
  private _config: ConfigInterface;
  private _configPlugins: NamespaceInterface;
  private _configMock: NamespaceInterface;
  private _configServer: NamespaceInterface;
  private _configFilesLoaders: NamespaceInterface;
  private _logOption: OptionInterface;
  private _alerts: AlertsInterface;
  private _updateNotifier: UpdateNotifierInterface;
  private _files: FilesInterface;
  private _variantHandlers: VariantHandlersInterface;
  private _mock: MockInterface;
  private _plugins: PluginsInterface;
  private _server: ServerInterface;
  private _scaffold: ScaffoldInterface;
  private _initialized: boolean;
  private _stopPluginsPromise: Promise<void> | null;
  private _startPluginsPromise: Promise<void> | null;
  private _version: string;

  constructor(
    programmaticConfig: ConfigurationObject = {},
    advancedOptions: CoreAdvancedOptions = {}
  ) {
    const packageJson = readJsonSync(path.resolve(__dirname, "..", "package.json"));
    this._version = packageJson.version;
    this._programmaticConfig = programmaticConfig;
    this._eventEmitter = new EventEmitter();

    // Create logger
    this._logger = new Logger("");
    this._configLogger = this._logger.namespace("config");

    // Create config
    this._config = new Config({ moduleName: MODULE_NAME });
    this._configPlugins = this._config.addNamespace(Plugins.id);
    this._configMock = this._config.addNamespace(Mock.id);
    this._configServer = this._config.addNamespace(Server.id);
    this._configFilesLoaders = this._config.addNamespace(Files.id);

    [this._logOption] = this._config.addOptions(ROOT_OPTIONS);
    this._logOption.onChange((data) => {
      const level = data as LogLevel;
      this._logger.setLevel(level);
    });

    // Create alerts
    this._alerts = new Alerts("alerts", { logger: this._logger });
    this._alerts.onChange(() => {
      this._eventEmitter.emit(CHANGE_ALERTS);
    });

    // Create update notifier
    this._updateNotifier = new UpdateNotifier({
      alerts: this._alerts.collection(UpdateNotifier.id),
      pkg: advancedOptions.pkg,
    });

    // Create variant handlers
    this._variantHandlers = new VariantHandlers({
      logger: this._logger.namespace(VariantHandlers.id),
      config: this._config.addNamespace(VariantHandlers.id),
    });

    // Create mock
    this._mock = new Mock(
      {
        config: this._configMock,
        alerts: this._alerts.collection(Mock.id),
        logger: this._logger.namespace(Mock.id),
        // TODO, pass router methods that the collection has to call when routes are set. This is needed to update routes in the server, and it allows to add more types of routers (http interceptors, etc)
        onChange: () => this._eventEmitter.emit(CHANGE_MOCK),
      },
      this // To be used only by routeHandlers
    );

    // Create plugins
    this._plugins = new Plugins(
      {
        config: this._configPlugins,
        alerts: this._alerts.collection(Plugins.id),
        logger: this._logger.namespace(Plugins.id),
      },
      this //To be used only by plugins
    );

    // Create server
    this._server = new Server({
      config: this._configServer,
      logger: this._logger.namespace(Server.id),
      alerts: this._alerts.collection(Server.id),
      mockRouter: this._mock.router, // Invert dependencies, mock should need server router when updating routes
    });

    const fileLoaders = this._mock.createLoaders();

    // Create files loaders
    this._files = new Files({
      config: this._configFilesLoaders,
      logger: this._logger.namespace(Files.id),
      alerts: this._alerts.collection(Files.id),
      // TODO, move to another element. Files loader has not to create default file loaders
      loadCollections: fileLoaders.loadCollections,
      loadRoutes: fileLoaders.loadRoutes,
    });

    // Create scaffold
    this._scaffold = new Scaffold({
      config: this._config, // It needs the whole configuration to get option properties and create scaffold
      alerts: this._alerts.collection(Scaffold.id),
      logger: this._logger.namespace(Scaffold.id),
    });

    this._initialized = false;
    this._stopPluginsPromise = null;
    this._startPluginsPromise = null;
  }

  async _startPlugins(): Promise<void> {
    if (!this._startPluginsPromise) {
      this._startPluginsPromise = this._plugins.start();
    }
    return this._startPluginsPromise.then(() => {
      this._startPluginsPromise = null;
    });
  }

  async _stopPlugins(): Promise<void> {
    if (!this._stopPluginsPromise) {
      this._stopPluginsPromise = this._plugins.stop();
    }
    return this._stopPluginsPromise.then(() => {
      this._stopPluginsPromise = null;
    });
  }

  async _loadConfig(): Promise<void> {
    await this._config.load();

    this._configLogger.debug(
      `Programmatic config: ${JSON.stringify(this._config.programmaticLoadedValues)}`
    );
    this._configLogger.debug(`Config from file: ${JSON.stringify(this._config.fileLoadedValues)}`);
    this._configLogger.debug(`Config from env: ${JSON.stringify(this._config.envLoadedValues)}`);
    this._configLogger.debug(`Config from args: ${JSON.stringify(this._config.argsLoadedValues)}`);
    this._configLogger.verbose(`Config: ${JSON.stringify(this._config.value)}`);
    this._configLogger.info(`Configuration loaded`);
  }

  public async init(programmaticConfig: ConfigurationObject = {}): Promise<void> {
    if (this._initialized) {
      // in case it has been initialized manually before
      return Promise.resolve();
    }
    this._initialized = true;

    if (programmaticConfig) {
      this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig, {
        arrayMerge,
      });
    }

    // Update notifier
    // TODO, move to about module
    this._updateNotifier.init();

    // Init config
    await this._config.init(this._programmaticConfig);
    this._logger.setLevel(this._logOption.value);

    // Register plugins, let them add their custom config
    await this._plugins.register();

    // Register variant handlers from configuration
    await this._variantHandlers.registerFromConfig();

    // TODO, add to data model
    await this._scaffold.init({
      folderPath: this._files.path,
    });

    await this._loadConfig();

    // Config is ready, init all
    this._mock.init(this._variantHandlers.handlers);
    await this._server.init();
    await this._files.init();
    return this._plugins.init();
  }

  public async start(): Promise<void> {
    await this.init();
    await this._server.start();
    this._files.start();
    return this._startPlugins();
  }

  public async stop(): Promise<void> {
    await this._server.stop();
    this._files.stop();
    return this._stopPlugins();
  }

  // Expose Server methods and getters

  public get alerts(): AlertsInterface {
    return this._alerts;
  }

  public get config(): ConfigInterface {
    return this._config;
  }

  public get logger(): LoggerInterface {
    return this._logger;
  }

  public get server(): ServerInterface {
    return this._server;
  }

  public get mock(): MockInterface {
    return this._mock;
  }

  // TODO, move to mock
  public get variantHandlers(): VariantHandlersInterface {
    return this._variantHandlers;
  }

  public get files(): FilesInterface {
    return this._files;
  }

  // TODO, move to about module
  public get version(): string {
    return this._version;
  }
};
