/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const http = require("http");

const express = require("express");
const {
  addRequestId,
  enableCors,
  jsonBodyParser,
  notFound,
  errorHandler,
  logRequest,
} = require("./middlewares");

const { ALL_HOSTS, serverUrl } = require("../common/helpers");

const START_ALERT_ID = "start";
const START_ERROR_MESSAGE = "Error starting server";
const SERVER_ALERT_ID = "server";

const OPTIONS = [
  {
    description: "Port number for the admin API server to be listening at",
    name: "port",
    type: "number",
    default: 3101,
  },
  {
    description: "Host for the admin API server",
    name: "host",
    type: "string",
    default: ALL_HOSTS,
  },
];

class Server {
  constructor({ alerts, logger, config, onChangeOptions }) {
    this._routers = [];
    this._config = config;
    this._alerts = alerts;
    this._logger = logger;
    this._error = null;
    [this._portOption, this._hostOption] = this._config.addOptions(OPTIONS);
    this._onChangeOptions = onChangeOptions;

    this._optionsChanged = this._optionsChanged.bind(this);
    this._startServer = this._startServer.bind(this);

    this._portOption.onChange(this._optionsChanged);
    this._hostOption.onChange(this._optionsChanged);
  }

  init() {
    this._emitOptionsChange();
  }

  _initServer() {
    this._express = express();
    this._server = http.createServer(this._express);

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

  _startServer(resolve) {
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
        this._logger.info(`Server started and listening at ${serverUrl({ host, port })}`);
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

  async restart() {
    await this.stop();
    return this.start();
  }

  _emitOptionsChange() {
    this._onChangeOptions({
      port: this._portOption.value,
      host: this._hostOption.value,
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
      this._server.close(() => {
        this._logger.info("Server stopped");
        this._serverStopping = false;
        resolve();
      });
    });
    return this._serverStopping;
  }
}

module.exports = Server;
