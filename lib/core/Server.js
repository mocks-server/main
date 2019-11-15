/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const path = require("path");
const http = require("http");

const express = require("express");
const _ = require("lodash");
const Boom = require("boom");
const watch = require("node-watch");

const Behaviors = require("./Behaviors");
const Settings = require("./Settings");
const tracer = require("./tracer");
const middlewares = require("./serverMiddlewares");
const { defaultOptions } = require("./Options");
const { FUNCTION_TYPE, WATCH_RELOAD } = require("./utils");

class Server {
  constructor(eventEmitter, options = {}) {
    this._customRouters = [];
    this._mocksFolder = this.resolveFolder(options.behaviors);
    this._options = { ...defaultOptions, ..._.omitBy(options, _.isUndefined) };
    this._eventEmitter = eventEmitter;
    this._settings = new Settings({
      delay: this._options.delay
    });
    this._error = null;

    tracer.set("console", this._options.log);

    this.startServer = this.startServer.bind(this);

    process.on("SIGINT", () => {
      this.stop().then(() => {
        console.log("SERVER CLOSED!!");
      });
      this.switchWatch(false);
      process.exit();
    });
  }

  init() {
    const currentBehavior =
      (this._behaviors && this._behaviors.currentName) || this._options.behavior;
    null;
    this._behaviors = new Behaviors(this._mocksFolder, currentBehavior, {
      recursive: this._options.recursive // TODO, remove unused recursive option
    });
    this._express = express();

    // Add middlewares
    this._express.use(middlewares.addRequestId);
    this._express.use(middlewares.enableCors);
    this._express.use(middlewares.addCommonHeaders);
    this._express.options("*", middlewares.enableCors);
    this._express.use(middlewares.jsonBodyParser);
    this._express.use(middlewares.traceRequest);
    this._addCustomRouters();
    this._express.use(this.fixturesMiddleware.bind(this));
    this._express.use(middlewares.notFound);
    this._express.use(middlewares.errorHandler);

    // Create server
    this._server = http.createServer(this._express);

    this._server.on("error", error => {
      tracer.error(`Server error: ${error.message}`);
      this._error = error;
      throw error;
    });

    this.switchWatch(this._options.watch);
    return Promise.resolve();
  }

  _addCustomRouters() {
    this._customRouters.forEach(customRouter => {
      this._express.use(customRouter.path, customRouter.router);
    });
  }

  addCustomRouter(path, router) {
    this._customRouters.push({
      path,
      router
    });
  }

  resolveFolder(folder) {
    if (!folder) {
      tracer.error(
        'Please provide a path to a folder containing behaviors using the "behaviors" option'
      );
      throw Boom.badData("Invalid mocks folder");
    }
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  getFixtureMatching(method, url) {
    return _.find(this._behaviors.current[method], fixture => fixture.route.match(url));
  }

  fixturesMiddleware(req, res, next) {
    const fixture = this.getFixtureMatching(req.method, req.url);
    if (fixture) {
      _.delay(() => {
        if (typeof fixture.response === FUNCTION_TYPE) {
          tracer.debug(`Fixture response is a function, executing response | ${req.id}`);
          req.params = fixture.route.match(req.url);
          fixture.response(req, res, next);
        } else {
          tracer.debug(`Sending fixture | ${req.id}`);
          res.status(fixture.response.status);
          res.send(fixture.response.body);
        }
      }, this._settings.delay);
    } else {
      next();
    }
  }

  startServer(resolve, reject) {
    try {
      this._server.listen(this._options, error => {
        if (error) {
          tracer.error(`Error starting server: ${error.message}`);
          this._serverStarting = false;
          this._serverStarted = false;
          this._error = error;
          reject(error);
        } else {
          tracer.info(`Server started and listening at http://localhost:${this._options.port}`);
          this._error = null;
          this._serverStarting = false;
          this._serverStarted = true;
          resolve(this);
        }
      });
    } catch (error) {
      reject(error);
    }
  }

  get settings() {
    return this._settings;
  }

  // TODO, deprecate features compatibility
  get features() {
    console.warn(
      `Deprecation warning: "features" getter will be deprecated. Use "behaviors" instead`
    );
    return this._behaviors;
  }

  get behaviors() {
    return this._behaviors;
  }

  get watchEnabled() {
    return this._watch;
  }

  get error() {
    return this._error;
  }

  get events() {
    return this._eventEmitter;
  }

  // TODO, move to a new class at charge of loading files, and reload when there are changes
  switchWatch(state) {
    this._watch = state;
    if (this._watch) {
      this._watcher = watch(
        this._mocksFolder,
        { recursive: true },
        _.debounce(() => {
          return this.restart()
            .catch(error => {
              this._error = error;
            })
            .then(() => {
              this._eventEmitter.emit(WATCH_RELOAD);
            });
        }),
        1000
      );
      return this._watcher;
    }
    if (this._watcher) {
      this._watcher.close();
    }
    return this._watcher;
  }

  stop() {
    if (this._server) {
      return new Promise(resolve => {
        this._server.close(() => {
          resolve();
        });
      });
    }
    return Promise.resolve();
  }

  async start() {
    return new Promise(this.startServer);
  }

  async restart() {
    this.stop();
    this.init();
    return this.start();
  }
}

module.exports = Server;
