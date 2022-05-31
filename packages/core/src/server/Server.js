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

const START_ALERT_ID = "start";
const START_ERROR_MESSAGE = "Error starting server";
const SERVER_ALERT_ID = "server";

const OPTIONS = [
  {
    description: "Port number for the server to be listening at",
    name: "port",
    type: "number",
    default: 3100,
  },
  {
    description: "Host for the server",
    name: "host",
    type: "string",
    default: ALL_HOSTS,
  },
];

const CORS_NAMESPACE = "cors";

const CORS_OPTIONS = [
  {
    description: "Use CORS middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the CORS middleware. Further information at https://github.com/expressjs/cors#configuration-options",
    name: "options",
    type: "object",
    default: {
      preflightContinue: false,
    },
  },
];

const JSON_BODY_PARSER_NAMESPACE = "jsonBodyParser";

const JSON_BODY_PARSER_OPTIONS = [
  {
    description: "Use json body-parser middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the json body-parser middleware. Further information at https://github.com/expressjs/body-parser",
    name: "options",
    type: "object",
    default: {},
  },
];

const URL_ENCODED_BODY_PARSER_NAMESPACE = "urlEncodedBodyParser";

const URL_ENCODED_BODY_PARSER_OPTIONS = [
  {
    description: "Use urlencoded body-parser middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the urlencoded body-parser middleware. Further information at https://github.com/expressjs/body-parser",
    name: "options",
    type: "object",
    default: { extended: true },
  },
];

class Server {
  static get id() {
    return "server";
  }

  constructor({ config, alerts, mocksRouter }) {
    this._config = config;
    const corsConfigNamespace = this._config.addNamespace(CORS_NAMESPACE);
    const jsonBodyParserConfigNamespace = this._config.addNamespace(JSON_BODY_PARSER_NAMESPACE);
    const formBodyParserConfigNamespace = this._config.addNamespace(
      URL_ENCODED_BODY_PARSER_NAMESPACE
    );

    [this._portOption, this._hostOption] = this._config.addOptions(OPTIONS);

    [this._corsEnabledOption, this._corsOptionsOption] =
      corsConfigNamespace.addOptions(CORS_OPTIONS);

    [this._jsonBodyParserEnabledOption, this._jsonBodyParserOptionsOption] =
      jsonBodyParserConfigNamespace.addOptions(JSON_BODY_PARSER_OPTIONS);

    [this._urlEncodedBodyParserEnabledOption, this._urlEncodedBodyParserOptionsOption] =
      formBodyParserConfigNamespace.addOptions(URL_ENCODED_BODY_PARSER_OPTIONS);

    this.restart = this.restart.bind(this);

    this._hostOption.onChange(this.restart);
    this._portOption.onChange(this.restart);
    this._corsEnabledOption.onChange(this.restart);
    this._corsOptionsOption.onChange(this.restart);
    this._jsonBodyParserEnabledOption.onChange(this.restart);
    this._jsonBodyParserOptionsOption.onChange(this.restart);
    this._urlEncodedBodyParserEnabledOption.onChange(this.restart);
    this._urlEncodedBodyParserOptionsOption.onChange(this.restart);

    this._mocksRouter = mocksRouter;
    this._customRouters = [];
    this._error = null;
    this._alerts = alerts;

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

    // TODO, move to variants router. Add options to routes to configure it
    if (this._corsEnabledOption.value) {
      this._express.use(cors(this._corsOptionsOption.value));
    }

    // TODO, move to middleware variant handler. Add options to variant to configure it
    if (this._jsonBodyParserEnabledOption.value) {
      this._express.use(middlewares.jsonBodyParser(this._jsonBodyParserOptionsOption.value));
    }
    if (this._urlEncodedBodyParserEnabledOption.value) {
      this._express.use(
        middlewares.urlEncodedBodyParser(this._urlEncodedBodyParserOptionsOption.value)
      );
    }

    // TODO, move to variants router. Add options to routes to configure it
    this._express.use(middlewares.traceRequest);
    this._registerCustomRouters();
    this._express.use(this._mocksRouter);

    // TODO, Add options to allow to disable or configure it
    this._express.use(middlewares.notFound);

    this._express.use(middlewares.errorHandler);

    // Create server
    this._server = http.createServer(this._express);
    this._alerts.remove(SERVER_ALERT_ID);
    this._server.on("error", (error) => {
      this._alerts.set(SERVER_ALERT_ID, "Server error", error);
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
            this._alerts.set(START_ALERT_ID, START_ERROR_MESSAGE, error);
            this._error = error;
            reject(error);
          } else {
            tracer.info(`Server started and listening at http://${hostName}:${port}`);
            this._error = null;
            this._serverStarting = false;
            this._serverStarted = true;
            this._alerts.remove(START_ALERT_ID);
            resolve(this);
          }
        }
      );
    } catch (error) {
      this._alerts.set(START_ALERT_ID, START_ERROR_MESSAGE, error);
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
