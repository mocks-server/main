/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import http from "http";
import type { Server as HttpServer } from "http";

import { DEFAULT_HOST, DEFAULT_PORT } from "@mocks-server/admin-api-paths";
import type { OptionInterfaceOfType } from "@mocks-server/config";
import type { ScopedCoreInterface } from "@mocks-server/core";
import express from "express";
import type { Application } from "express";

import { readFileSync, serverUrl, HTTPS_PROTOCOL, HTTP_PROTOCOL } from "../common/Helpers";

import {
  addRequestId,
  enableCors,
  jsonBodyParser,
  notFound,
  errorHandler,
  logRequest,
} from "./Middlewares";

import type {
  HostOptionDefinition,
  HttpsCertOptionDefinition,
  HttpsKeyOptionDefinition,
  HttpsProtocolOptionDefinition,
  PortNumberOptionDefinition,
  ServerConstructor,
  ServerConstructorOptions,
  ServerInterface,
  ServerRouter,
  OnChangeOptions,
} from "./Server.types";

const START_ALERT_ID = "start";
const START_ERROR_MESSAGE = "Error starting server";
const SERVER_ALERT_ID = "server";

const OPTIONS: [PortNumberOptionDefinition, HostOptionDefinition] = [
  {
    description: "Port number for the admin API server to be listening at",
    name: "port",
    type: "number",
    default: DEFAULT_PORT,
  },
  {
    description: "Host for the admin API server",
    name: "host",
    type: "string",
    default: DEFAULT_HOST,
  },
];

const HTTPS_NAMESPACE = "https";

const HTTPS_OPTIONS: [
  HttpsProtocolOptionDefinition,
  HttpsCertOptionDefinition,
  HttpsKeyOptionDefinition
] = [
  {
    description: "Use https protocol or not",
    name: "enabled",
    type: "boolean",
    default: false,
  },
  {
    description: "Path to a TLS/SSL certificate",
    name: "cert",
    type: "string",
  },
  {
    description: "Path to the certificate private key",
    name: "key",
    type: "string",
  },
];

export const Server: ServerConstructor = class Server implements ServerInterface {
  private _portOption: OptionInterfaceOfType<number, { hasDefault: true }>;
  private _hostOption: OptionInterfaceOfType<string, { hasDefault: true }>;
  private _httpsEnabledOption: OptionInterfaceOfType<boolean, { hasDefault: true }>;
  private _httpsCertOption: OptionInterfaceOfType<string>;
  private _httpsKeyOption: OptionInterfaceOfType<string>;
  private _routers: ServerRouter[];
  private _config: ScopedCoreInterface["config"];
  private _alerts: ScopedCoreInterface["alerts"];
  private _logger: ScopedCoreInterface["logger"];
  private _error: Error | null;
  private _onChangeOptions: OnChangeOptions;
  private _express: Application;
  private _server: HttpServer | null;
  private _serverInitError: Error | null;
  private _serverStarting: Promise<void> | null;
  private _serverStopping: Promise<void> | null;

  constructor({ alerts, logger, config, onChangeOptions }: ServerConstructorOptions) {
    this._server = null;
    this._routers = [];
    this._config = config;
    this._alerts = alerts;
    this._logger = logger;
    this._error = null;
    const httpsConfigNamespace = this._config.addNamespace(HTTPS_NAMESPACE);

    [this._portOption, this._hostOption] = this._config.addOptions(OPTIONS) as [
      OptionInterfaceOfType<number, { hasDefault: true }>,
      OptionInterfaceOfType<string, { hasDefault: true }>
    ];
    [this._httpsEnabledOption, this._httpsCertOption, this._httpsKeyOption] =
      httpsConfigNamespace.addOptions(HTTPS_OPTIONS) as [
        OptionInterfaceOfType<boolean, { hasDefault: true }>,
        OptionInterfaceOfType<string>,
        OptionInterfaceOfType<string>
      ];
    this._onChangeOptions = onChangeOptions;

    this._optionsChanged = this._optionsChanged.bind(this);
    this._startServer = this._startServer.bind(this);

    this._portOption.onChange(this._optionsChanged);
    this._hostOption.onChange(this._optionsChanged);
    this._httpsEnabledOption.onChange(this._optionsChanged);
    this._httpsCertOption.onChange(this._optionsChanged);
    this._httpsKeyOption.onChange(this._optionsChanged);
  }

  public get protocol() {
    return this._httpsEnabledOption.value ? HTTPS_PROTOCOL : HTTP_PROTOCOL;
  }

  public get url() {
    return serverUrl({
      host: this._hostOption.value,
      port: this._portOption.value,
      protocol: this.protocol,
    });
  }

  public init() {
    this._emitOptionsChange();
  }

  public async restart(): Promise<void> {
    await this.stop();
    return this.start();
  }

  public async start(): Promise<void> {
    if (this._serverStarting) {
      this._logger.debug("Server is already starting, returning same promise");
      return this._serverStarting;
    }
    await this._initServer();
    this._serverStarting = new Promise(this._startServer);
    return this._serverStarting;
  }

  public addRouter(router: ServerRouter): void {
    this._routers.push(router);
  }

  public async stop() {
    if (this._serverStopping) {
      this._logger.debug("Server is already stopping, returning same promise");
      return this._serverStopping;
    }
    this._serverStopping = new Promise((resolve) => {
      this._logger.verbose("Stopping server");
      if (this._server) {
        this._server.close(() => {
          this._logger.info("Server stopped");
          this._serverStopping = null;
          resolve();
        });
      } else {
        setTimeout(() => {
          resolve();
          this._serverStopping = null;
        }, 200);
      }
    });
    return this._serverStopping;
  }

  private async _initServer() {
    this._express = express();
    this._server = await this._createServer();
    if (this._server) {
      this._express.use(addRequestId());
      this._express.use(enableCors());
      this._express.use(jsonBodyParser());
      this._express.use(logRequest({ logger: this._logger }));

      this._routers.forEach((router) => {
        this._express.use(router.path, router.router);
      });

      this._express.use(notFound({ logger: this._logger }));
      this._express.use(errorHandler({ logger: this._logger }));

      this._alerts.remove(SERVER_ALERT_ID);
      this._server.on("error", (error) => {
        this._alerts.set(SERVER_ALERT_ID, "Server error", error);
        this._error = error;
      });
    }
  }

  private async _createHttpsServer(): Promise<HttpServer | null> {
    this._logger.verbose("Creating HTTPS server");
    try {
      const https = await import("https");
      return https.createServer(
        {
          cert: readFileSync(this._httpsCertOption.value as string),
          key: readFileSync(this._httpsKeyOption.value as string),
        },
        this._express
      );
    } catch (error) {
      this._alerts.set(START_ALERT_ID, "Error creating HTTPS server", error as Error);
      this._serverInitError = error as Error;
      return null;
    }
  }

  private _createHttpServer(): HttpServer {
    this._logger.verbose("Creating HTTP server");
    return http.createServer(this._express);
  }

  private async _createServer(): Promise<HttpServer | null> {
    this._server = null;
    return this._httpsEnabledOption.value ? this._createHttpsServer() : this._createHttpServer();
  }

  private _startServer(resolve: () => unknown): void {
    if (!this._server) {
      this._logger.debug(`No server found. Resolving`);
      setTimeout(() => {
        resolve();
        this._serverStarting = null;
      }, 200);
    } else {
      this._logger.debug(`Starting server`);
      const host = this._hostOption.value;
      const port = this._portOption.value;

      const timedOut = setTimeout(() => {
        callback(new Error("Server timed out trying to start"));
      }, 3000);

      const callback = (error?: Error) => {
        clearTimeout(timedOut);
        if (error) {
          this._logger.error(`Error starting server: ${error.message}`);
          this._serverStarting = null;
          this._alerts.set(START_ALERT_ID, START_ERROR_MESSAGE, error);
          this._error = error;
          resolve();
        } else {
          this._logger.info(`Server started and listening at ${this.url}`);
          this._error = null;
          this._serverStarting = null;
          this._alerts.remove(START_ALERT_ID);
          resolve();
        }
      };
      this._server.listen(
        {
          port,
          host,
        },
        callback
      );
    }
  }

  private _emitOptionsChange(): void {
    this._onChangeOptions({
      port: this._portOption.value,
      host: this._hostOption.value,
      protocol: this.protocol,
    });
  }

  private _optionsChanged(): void {
    this._emitOptionsChange();
    this.restart();
  }
};
