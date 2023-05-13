/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import http from "http";
import type { Server as HttpServer } from "http";

import type { NamespaceInterface, OptionInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import cors from "cors";
import express from "express";
import type { Application } from "express";

import type { AlertsInterface } from "../alerts/Alerts.types";
import { readFileSync } from "../common/Helpers";

import {
  addRequestId,
  jsonBodyParser,
  logRequest,
  urlEncodedBodyParser,
  notFound,
  errorHandler,
} from "./middlewares";
import type {
  ServerConstructor,
  ServerOptions,
  ServerInterface,
  Router,
  CustomRouter,
  ProtocolHttps,
  ProtocolHttp,
  RequestHandler,
} from "./Server.types";
import {
  CORS_NAMESPACE,
  JSON_BODY_PARSER_NAMESPACE,
  URL_ENCODED_BODY_PARSER_NAMESPACE,
  HTTPS_NAMESPACE,
  OPTIONS,
  CORS_OPTIONS,
  JSON_BODY_PARSER_OPTIONS,
  URL_ENCODED_BODY_PARSER_OPTIONS,
  HTTPS_OPTIONS,
  ALL_HOSTS,
} from "./ServerOptions";

const LOCALHOST = "localhost";
const HTTPS_ALERT_ID = "https";
const START_ALERT_ID = "start";
const START_ERROR_MESSAGE = "Error starting server";
const SERVER_ALERT_ID = "server";

export const Server: ServerConstructor = class Server implements ServerInterface {
  private _logger: LoggerInterface;
  private _config: NamespaceInterface;
  private _mockRouter: RequestHandler;
  private _customRouters: CustomRouter[];
  private _alerts: AlertsInterface;
  private _portOption: OptionInterface;
  private _hostOption: OptionInterface;
  private _corsEnabledOption: OptionInterface;
  private _corsOptionsOption: OptionInterface;
  private _jsonBodyParserEnabledOption: OptionInterface;
  private _jsonBodyParserOptionsOption: OptionInterface;
  private _urlEncodedBodyParserEnabledOption: OptionInterface;
  private _urlEncodedBodyParserOptionsOption: OptionInterface;
  private _httpsEnabledOption: OptionInterface;
  private _httpsCertOption: OptionInterface;
  private _httpsKeyOption: OptionInterface;
  private _express: Application;
  private _serverInitialized: boolean;
  private _server?: HttpServer;
  private _serverInitError?: Error;
  private _serverStarted: boolean;
  private _serverStartingPromise: Promise<void> | undefined;
  private _serverStoppingPromise: Promise<void> | undefined;

  static get id(): string {
    return "server";
  }

  constructor({ config, alerts, mockRouter, logger }: ServerOptions) {
    this._logger = logger;
    this._config = config;
    this._mockRouter = mockRouter;
    this._customRouters = [];
    this._alerts = alerts;

    const corsConfigNamespace = this._config.addNamespace(CORS_NAMESPACE);
    const jsonBodyParserConfigNamespace = this._config.addNamespace(JSON_BODY_PARSER_NAMESPACE);
    const formBodyParserConfigNamespace = this._config.addNamespace(
      URL_ENCODED_BODY_PARSER_NAMESPACE
    );
    const httpsConfigNamespace = this._config.addNamespace(HTTPS_NAMESPACE);

    [this._portOption, this._hostOption] = this._config.addOptions(OPTIONS);

    [this._corsEnabledOption, this._corsOptionsOption] =
      corsConfigNamespace.addOptions(CORS_OPTIONS);

    [this._jsonBodyParserEnabledOption, this._jsonBodyParserOptionsOption] =
      jsonBodyParserConfigNamespace.addOptions(JSON_BODY_PARSER_OPTIONS);

    [this._urlEncodedBodyParserEnabledOption, this._urlEncodedBodyParserOptionsOption] =
      formBodyParserConfigNamespace.addOptions(URL_ENCODED_BODY_PARSER_OPTIONS);

    [this._httpsEnabledOption, this._httpsCertOption, this._httpsKeyOption] =
      httpsConfigNamespace.addOptions(HTTPS_OPTIONS);

    this.restart = this.restart.bind(this);
    this._reinitializeServer = this._reinitializeServer.bind(this);
    this._startServer = this._startServer.bind(this);

    this._hostOption.onChange(this.restart);
    this._portOption.onChange(this.restart);
    this._corsEnabledOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._corsOptionsOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._jsonBodyParserEnabledOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._jsonBodyParserOptionsOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._urlEncodedBodyParserEnabledOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._urlEncodedBodyParserOptionsOption.onChange(this.restart); // TODO, reinitialize server instead of restart
    this._httpsEnabledOption.onChange(this._reinitializeServer);
    this._httpsCertOption.onChange(this._reinitializeServer);
    this._httpsKeyOption.onChange(this._reinitializeServer);
  }

  public init(): Promise<void> {
    process.on("SIGINT", () => {
      this.stop().then(() => {
        this._logger.info("Server closed");
      });
      process.exit();
    });
    return Promise.resolve();
  }

  private async _initServer(): Promise<void> {
    if (this._serverInitialized) {
      return;
    }
    this._logger.debug("Configuring server");
    this._express = express();

    // Add middlewares
    this._express.use(addRequestId());

    // TODO, move to variants router. Add options to routes to configure it
    if (this._corsEnabledOption.value) {
      this._express.use(cors(this._corsOptionsOption.value));
    }

    // TODO, move to middleware variant handler. Add options to variant to configure it
    if (this._jsonBodyParserEnabledOption.value) {
      this._express.use(jsonBodyParser(this._jsonBodyParserOptionsOption.value));
    }
    if (this._urlEncodedBodyParserEnabledOption.value) {
      this._express.use(urlEncodedBodyParser(this._urlEncodedBodyParserOptionsOption.value));
    }

    // TODO, move to variants router. Add options to routes to configure it
    this._express.use(logRequest({ logger: this._logger }));
    this._registerCustomRouters();
    this._express.use(this._mockRouter);

    // TODO, Add options to allow to disable or configure it
    this._express.use(notFound({ logger: this._logger }));
    this._express.use(errorHandler({ logger: this._logger }));

    // Create server
    this._server = await this._createServer();
    if (this._server) {
      this._alerts.remove(SERVER_ALERT_ID);
      this._server.on("error", (error) => {
        this._alerts.set(SERVER_ALERT_ID, "Server error", error);
        throw error;
      });
      this._serverInitialized = true;
    } else {
      this._alerts.set(SERVER_ALERT_ID, "Server not initialized");
      this._serverInitialized = false;
    }
  }

  private async _createHttpsServer(): Promise<HttpServer | undefined> {
    this._logger.verbose("Creating HTTPS server");
    this._alerts.remove(HTTPS_ALERT_ID);
    try {
      const https = await import("https");
      return https.createServer(
        {
          cert: readFileSync(this._httpsCertOption.value),
          key: readFileSync(this._httpsKeyOption.value),
        },
        this._express
      );
    } catch (error) {
      this._alerts.set(HTTPS_ALERT_ID, "Error creating HTTPS server", error as Error);
      this._serverInitError = error as Error;
    }
  }

  private _createHttpServer(): Promise<HttpServer> {
    this._logger.verbose("Creating HTTP server");
    return Promise.resolve(http.createServer(this._express));
  }

  private _createServer(): Promise<HttpServer | undefined> {
    this._server = undefined;
    return this._httpsEnabledOption.value ? this._createHttpsServer() : this._createHttpServer();
  }

  private _reinitializeServer(): Promise<void> {
    if (this._serverInitialized) {
      this._serverInitialized = false;
      if (this._serverStarted) {
        return this.restart();
      }
      if (this._serverStartingPromise) {
        return this._serverStartingPromise.then(() => {
          return this.restart();
        });
      }
    }
    return Promise.resolve();
  }

  private _startServer(resolve: () => unknown, reject: (error: Error) => unknown): void {
    const host = this._hostOption.value;
    const port = this._portOption.value;

    try {
      const server = this._server as HttpServer;
      server.listen(
        {
          port,
          host,
        },
        () => {
          this._alerts.remove(START_ALERT_ID);
          this._logger.info(`Server started and listening at ${this.url}`);
          this._serverStarted = true;
          this._serverStartingPromise = undefined;
          resolve();
        }
      );
    } catch (error) {
      this._alerts.set(START_ALERT_ID, START_ERROR_MESSAGE, error as Error);
      this._serverStartingPromise = undefined;
      this._serverStarted = false;
      reject(error as Error);
    }
  }

  private _registerCustomRouters(): void {
    this._logger.debug("Registering custom routers in server");
    this._customRouters.forEach((customRouter) => {
      this._logger.silly(`Registering custom router with path ${customRouter.path}`);
      this._express.use(customRouter.path, customRouter.router);
    });
  }

  public stop(): Promise<void> {
    if (this._serverStoppingPromise) {
      return this._serverStoppingPromise;
    }
    if (this._server) {
      const server = this._server as HttpServer;
      this._serverStoppingPromise = new Promise((resolve) => {
        this._logger.verbose("Stopping server");
        server.close(() => {
          this._logger.info("Server stopped");
          this._serverStarted = false;
          this._serverStoppingPromise = undefined;
          resolve();
        });
      });

      return this._serverStoppingPromise;
    }
    return Promise.resolve();
  }

  public async start(): Promise<void> {
    await this._initServer();
    if (this._serverStartingPromise) {
      this._logger.debug("Server is already starting, returning same promise");
      return this._serverStartingPromise;
    }
    this._serverStartingPromise = new Promise(this._startServer);
    return this._serverStartingPromise;
  }

  public async restart(): Promise<void> {
    await this.stop();
    return this.start();
  }

  private _getCustomRouterIndex(path: string, router: Router): number | null {
    let routerIndex = null;
    this._customRouters.forEach((customRouter, index) => {
      if (customRouter.path === path && customRouter.router === router) {
        routerIndex = index;
      }
    });
    return routerIndex;
  }

  public addRouter(path: string, router: Router): Promise<void> {
    this._logger.info(`Adding custom router with path ${path}`);
    this._customRouters.push({
      path,
      router,
    });
    return this._reinitializeServer();
  }

  public removeRouter(path: string, router: Router): Promise<void> {
    this._logger.info(`Removing custom router with path ${path}`);
    const indexToRemove = this._getCustomRouterIndex(path, router);
    if (indexToRemove !== null) {
      this._customRouters.splice(indexToRemove, 1);
      return this._reinitializeServer();
    }
    return Promise.resolve();
  }

  public get protocol(): ProtocolHttp | ProtocolHttps {
    return this._httpsEnabledOption.value ? "https" : "http";
  }

  public get url(): string {
    const host = this._hostOption.value;
    const hostName = host === ALL_HOSTS ? LOCALHOST : host;
    return `${this.protocol}://${hostName}:${this._portOption.value}`;
  }
};
