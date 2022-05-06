/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const http = require("http");

const express = require("express");
const cors = require("cors");
const tracer = require("../tracer");
const middlewares = require("./middlewares");

const ALL_HOSTS = "0.0.0.0";
const LOCALHOST = "localhost";

const OPTIONS = [
  {
    name: "port",
    type: "number",
    default: 3100,
  },
  {
    name: "host",
    type: "string",
    default: ALL_HOSTS,
  },
  {
    name: "cors",
    type: "boolean",
    default: true,
  },
  {
    name: "corsPreFlight",
    type: "boolean",
    default: true,
  },
];

class Server {
  constructor({ config, addAlert, removeAlerts, mocksRouter }) {
    this._config = config;

    [this._portOption, this._hostOption, this._corsOption, this._corsPreFlightOption] =
      this._config.addOptions(OPTIONS);

    this._hostOption.onChange(this.restart.bind(this));
    this._portOption.onChange(this.restart.bind(this));
    this._corsOption.onChange(this.restart.bind(this));
    this._corsPreFlightOption.onChange(this.restart.bind(this));

    this._mocksRouter = mocksRouter;
    this._customRouters = [];
    this._error = null;
    this._addAlert = addAlert;
    this._removeAlerts = removeAlerts;

    this._startServer = this._startServer.bind(this);
  }

  init() {
    process.on("SIGINT", () => {
      this.stop().then(() => {
        tracer.info("Server closed");
      });
      process.exit();
    });
    return Promise.resolve();
  }

  _initServer() {
    if (this._serverInitted) {
      return;
    }
    tracer.debug("Configuring server");
    this._express = express();

    // Add middlewares
    this._express.use(middlewares.addRequestId);
    if (this._corsOption.value) {
      this._express.use(
        cors({
          preflightContinue: !this._corsPreFlightOption.value,
        })
      );
    }
    this._express.use(middlewares.jsonBodyParser);
    this._express.use(middlewares.formBodyParser);
    this._express.use(middlewares.traceRequest);
    this._registerCustomRouters();
    this._express.use(this._mocksRouter);
    this._express.use(middlewares.notFound);
    this._express.use(middlewares.errorHandler);

    // Create server
    this._server = http.createServer(this._express);
    this._removeAlerts("server");
    this._server.on("error", (error) => {
      this._addAlert("server", `Server error`, error);
      this._error = error;
      throw error;
    });
    this._serverInitted = true;
  }

  _reinitServer() {
    if (this._serverInitted) {
      this._serverInitted = false;
      if (this._serverStarted) {
        return this.restart();
      }
      if (this._serverStarting) {
        return this._serverStarting.then(() => {
          return this.restart();
        });
      }
    }
    return Promise.resolve();
  }

  _startServer(resolve, reject) {
    const host = this._hostOption.value;
    const port = this._portOption.value;
    const hostName = host === ALL_HOSTS ? LOCALHOST : host;

    try {
      this._server.listen(
        {
          port,
          host,
        },
        (error) => {
          if (error) {
            this._serverStarting = false;
            this._serverStarted = false;
            this._addAlert("start", `Error starting server`, error);
            this._error = error;
            reject(error);
          } else {
            tracer.info(`Server started and listening at http://${hostName}:${port}`);
            this._error = null;
            this._serverStarting = false;
            this._serverStarted = true;
            this._removeAlerts("start");
            resolve(this);
          }
        }
      );
    } catch (error) {
      this._addAlert("start", `Error starting server`, error);
      reject(error);
    }
  }

  _registerCustomRouters() {
    tracer.debug("Registering custom routers in server");
    this._customRouters.forEach((customRouter) => {
      tracer.silly(`Registering custom router with path ${customRouter.path}`);
      this._express.use(customRouter.path, customRouter.router);
    });
  }

  stop() {
    if (this._serverStopping) {
      return this._serverStopping;
    }
    if (this._server) {
      this._serverStopping = new Promise((resolve) => {
        tracer.verbose("Stopping server");
        this._server.close(() => {
          tracer.info("Server stopped");
          this._serverStarted = false;
          this._serverStopping = false;
          resolve();
        });
      });
      return this._serverStopping;
    }
    return Promise.resolve();
  }

  async start() {
    this._initServer();
    if (this._serverStarting) {
      tracer.debug("Server is already starting, returning same promise");
      return this._serverStarting;
    }
    this._serverStarting = new Promise(this._startServer);
    return this._serverStarting;
  }

  _getCustomRouterIndex(path, router) {
    let routerIndex = null;
    this._customRouters.forEach((customRouter, index) => {
      if (customRouter.path === path && customRouter.router === router) {
        routerIndex = index;
      }
    });
    return routerIndex;
  }

  addCustomRouter(path, router) {
    tracer.info(`Adding custom router with path ${path}`);
    this._customRouters.push({
      path,
      router,
    });
    return this._reinitServer();
  }

  removeCustomRouter(path, router) {
    tracer.info(`Removing custom router with path ${path}`);
    let indexToRemove = this._getCustomRouterIndex(path, router);
    if (indexToRemove !== null) {
      this._customRouters.splice(indexToRemove, 1);
      return this._reinitServer();
    }
    return Promise.resolve();
  }

  async restart() {
    await this.stop();
    return this.start();
  }

  get error() {
    return this._error;
  }
}

module.exports = Server;
