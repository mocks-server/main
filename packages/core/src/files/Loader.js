class Loader {
  constructor({ id, alerts, logger, src, onLoad, getRootPath }) {
    this._id = id;
    this._logger = logger;
    this._alerts = alerts;
    this._src = src;
    this._onLoad = onLoad;
    this._getRootPath = getRootPath;
  }

  load(filesContents, fileErrors) {
    this._onLoad(filesContents, fileErrors);
  }

  get logger() {
    return this._logger;
  }

  get alerts() {
    return this._alerts;
  }

  get basePath() {
    return this._getRootPath();
  }

  get id() {
    return this._id;
  }

  get src() {
    return this._src;
  }
}

module.exports = Loader;
