/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const http = require("http");

const express = require("express");
const { delay, find } = require("lodash");
const tracer = require("../tracer");
const middlewares = require("./middlewares");

class Server {
  constructor(mocks, settings, eventEmitter) {
    this._mocks = mocks;
    this._eventEmitter = eventEmitter;
    this._customRouters = [];
    this._settings = settings;
    this._error = null;

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
    this._serverInitted = true;
    this._express = express();

    // Add middlewares
    this._express.use(middlewares.addRequestId);
    this._express.use(middlewares.enableCors);
    this._express.use(middlewares.addCommonHeaders);
    this._express.options("*", middlewares.enableCors);
    this._express.use(middlewares.jsonBodyParser);
    this._express.use(middlewares.traceRequest);
    this._registerCustomRouters();
    this._express.use(this._fixturesMiddleware.bind(this));
    this._express.use(middlewares.notFound);
    this._express.use(middlewares.errorHandler);

    // Create server
    this._server = http.createServer(this._express);

    this._server.on("error", error => {
      tracer.error(`Server error: ${error.message}`);
      this._error = error;
      throw error;
    });
  }

  _startServer(resolve, reject) {
    try {
      this._server.listen(
        {
          port: this._settings.get("port"),
          host: this._settings.get("host")
        },
        error => {
          if (error) {
            tracer.error(`Error starting server: ${error.message}`);
            this._serverStarting = false;
            this._serverStarted = false;
            this._error = error;
            reject(error);
          } else {
            tracer.info(
              `Server started and listening at http://localhost:${this._settings.get("port")}`
            );
            this._error = null;
            this._serverStarting = false;
            this._serverStarted = true;
            resolve(this);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  }

  _registerCustomRouters() {
    this._customRouters.forEach(customRouter => {
      this._express.use(customRouter.path, customRouter.router);
    });
  }

  _getFixtureMatching(method, url) {
    return (
      this._mocks.behaviors.current &&
      find(this._mocks.behaviors.current[method], fixture => fixture.route.match(url))
    );
  }

  _fixturesMiddleware(req, res, next) {
    const fixture = this._getFixtureMatching(req.method, req.url);
    if (fixture) {
      delay(() => {
        // TODO, add property to fixtures indicating type
        if (typeof fixture.response === "function") {
          tracer.debug(`Fixture response is a function, executing response | ${req.id}`);
          req.params = fixture.route.match(req.url);
          fixture.response(req, res, next);
        } else {
          tracer.debug(`Sending fixture | ${req.id}`);
          res.status(fixture.response.status);
          res.send(fixture.response.body);
        }
      }, this._settings.get("delay"));
    } else {
      next();
    }
  }

  stop() {
    if (this._server) {
      return new Promise(resolve => {
        tracer.verbose("Stopping server");
        this._server.close(() => {
          tracer.info("Server stopped");
          resolve();
        });
      });
    }
    return Promise.resolve();
  }

  async start() {
    this._initServer();
    return new Promise(this._startServer);
  }

  addCustomRouter(path, router) {
    this._customRouters.push({
      path,
      router
    });
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
