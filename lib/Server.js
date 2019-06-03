"use strict";

const path = require("path");
const http = require("http");
const EventEmitter = require("events");

const express = require("express");
const _ = require("lodash");
const Boom = require("boom");
const watch = require("node-watch");

const Features = require("./features/Features");
const Api = require("./api/Api");
const Settings = require("./Settings");
const tracer = require("./common/tracer");
const middlewares = require("./middlewares");
const { defaultOptions } = require("./common/options");
const { FUNCTION_TYPE, WATCH_RELOAD } = require("./common/constants");

class ServerEmitter extends EventEmitter {}

class Server {
  constructor(featuresFolder, options = {}) {
    this._featuresFolder = this.resolveFolder(featuresFolder);
    this._options = { ...defaultOptions, ..._.omitBy(options, _.isUndefined) };
    this._eventEmitter = new ServerEmitter();
    this._settings = new Settings({
      delay: this._options.delay
    });
    this._error = null;

    tracer.set("console", this._options.log);

    this.startServer = this.startServer.bind(this);
    this.init();

    this._server.on("error", error => {
      tracer.error(`Server error: ${error.message}`);
      this._error = error;
      throw error;
    });

    this.switchWatch(this._options.watch);

    process.on("SIGINT", () => {
      this.stop();
      this.switchWatch(false);
    });
  }

  init() {
    const currentFeature = (this._features && this._features.currentName) || this._options.feature;
    this._features = new Features(this._featuresFolder, currentFeature, {
      recursive: this._options.recursive
    });
    this._app = express();

    // Add middlewares
    this._app.use(middlewares.addRequestId);
    this._app.use(middlewares.enableCors);
    this._app.use(middlewares.addCommonHeaders);
    this._app.options("*", middlewares.enableCors);
    this._app.use(middlewares.jsonBodyParser);
    this._app.use(middlewares.traceRequest);
    this._app.use("/mocks", new Api(this._features, this._settings).router);
    this._app.use(this.featuresMiddleWare.bind(this));
    this._app.use(middlewares.notFound);
    this._app.use(middlewares.errorHandler);

    // Create server
    this._server = http.createServer(this._app);
  }

  resolveFolder(folder) {
    if (!folder) {
      throw Boom.badData(
        'Please provide a path to a folder containing features using the "features" option'
      );
    }
    if (path.isAbsolute(folder)) {
      return folder;
    }
    return path.resolve(process.cwd(), folder);
  }

  getFixtureMatching(method, url) {
    return _.find(this._features.current[method], fixture => fixture.route.match(url));
  }

  featuresMiddleWare(req, res, next) {
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
    this._server.listen(this._options, error => {
      if (error) {
        tracer.error(`Error starting server: ${error.message}`);
        this._error = error;
        reject(error);
      } else {
        tracer.info(`Server started and listening at http://localhost:${this._options.port}`);
        this._error = null;
        resolve(this);
      }
    });
  }

  get settings() {
    return this._settings;
  }

  get features() {
    return this._features;
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

  switchWatch(state) {
    this._watch = state;
    if (this._watch) {
      this._watcher = watch(
        this._featuresFolder,
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
    this._server.close();
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
