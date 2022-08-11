/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const http = require("http");

const express = require("express");
const { DEFAULT_HOST, DEFAULT_PORT } = require("@mocks-server/admin-api-paths");

const {
  addRequestId,
  enableCors,
  jsonBodyParser,
  notFound,
  errorHandler,
  logRequest,
} = require("./middlewares");

const { readFileSync, serverUrl, HTTPS_PROTOCOL, HTTP_PROTOCOL } = require("../common/helpers");

const START_ALERT_ID = "start";
const START_ERROR_MESSAGE = "Error starting server";
const SERVER_ALERT_ID = "server";

const OPTIONS = [
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

const HTTPS_OPTIONS = [
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

class Server {
  constructor({ alerts, logger, config, onChangeOptions }) {
    this._routers = [];
    this._config = config;
    this._alerts = alerts;
    this._logger = logger;
    this._error = null;
    const httpsConfigNamespace = this._config.addNamespace(HTTPS_NAMESPACE);

    [this._portOption, this._hostOption] = this._config.addOptions(OPTIONS);
    [this._httpsEnabledOption, this._httpsCertOption, this._httpsKeyOption] =
      httpsConfigNamespace.addOptions(HTTPS_OPTIONS);
    this._onChangeOptions = onChangeOptions;

    this._optionsChanged = this._optionsChanged.bind(this);
    this._startServer = this._startServer.bind(this);

    this._portOption.onChange(this._optionsChanged);
    this._hostOption.onChange(this._optionsChanged);
    this._httpsEnabledOption.onChange(this._optionsChanged);
    this._httpsCertOption.onChange(this._optionsChanged);
    this._httpsKeyOption.onChange(this._optionsChanged);
  }

  init() {
    this._emitOptionsChange();
  }

  _initServer() {
    this._express = express();
    this._server = this._createServer();
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

  _createHttpsServer() {
    this._logger.verbose("Creating HTTPS server");
    try {
      const https = require("https");
      return https.createServer(
        {
          cert: readFileSync(this._httpsCertOption.value),
          key: readFileSync(this._httpsKeyOption.value),
        },
        this._express
      );
    } catch (error) {
      this._alerts.set(START_ALERT_ID, "Error creating HTTPS server", error);
      this._serverInitError = error;
    }
  }

  _createHttpServer() {
    this._logger.verbose("Creating HTTP server");
    return http.createServer(this._express);
  }

  _createServer() {
    this._server = null;
    return !!this._httpsEnabledOption.value ? this._createHttpsServer() : this._createHttpServer();
  }

  _startServer(resolve) {
    if (!this._server) {
      setTimeout(() => {
        resolve();
        this._serverStarting = false;
      }, 200);
    } else {
      const host = this._hostOption.value;
      const port = this._portOption.value;

      const timedOut = setTimeout(() => {
        callback(new Error("Server timed out trying to start"));
      }, 3000);

      const callback = (error) => {
        clearTimeout(timedOut);
        if (error) {
          this._serverStarting = false;
          this._alerts.set(START_ALERT_ID, START_ERROR_MESSAGE, error);
          this._error = error;
          resolve();
        } else {
          this._logger.info(`Server started and listening at ${this.url}`);
          this._error = null;
          this._serverStarting = false;
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

  async restart() {
    await this.stop();
    return this.start();
  }

  _emitOptionsChange() {
    this._onChangeOptions({
      port: this._portOption.value,
      host: this._hostOption.value,
      protocol: this.protocol,
    });
  }

  _optionsChanged() {
    this._emitOptionsChange();
    this.restart();
  }

  async start() {
    if (this._serverStarting) {
      this._logger.debug("Server is already starting, returning same promise");
      return this._serverStarting;
    }
    this._initServer();
    this._serverStarting = new Promise(this._startServer);
    return this._serverStarting;
  }

  addRouter(router) {
    this._routers.push(router);
  }

  stop() {
    if (this._serverStopping) {
      this._logger.debug("Server is already stopping, returning same promise");
      return this._serverStopping;
    }
    this._serverStopping = new Promise((resolve) => {
      this._logger.verbose("Stopping server");
      if (this._server) {
        this._server.close(() => {
          this._logger.info("Server stopped");
          this._serverStopping = false;
          resolve();
        });
      } else {
        setTimeout(() => {
          resolve();
          this._serverStopping = false;
        }, 200);
      }
    });
    return this._serverStopping;
  }

  get protocol() {
    return !!this._httpsEnabledOption.value ? HTTPS_PROTOCOL : HTTP_PROTOCOL;
  }

  get url() {
    return serverUrl({
      host: this._hostOption.value,
      port: this._portOption.value,
      protocol: this.protocol,
    });
  }
}

module.exports = Server;
