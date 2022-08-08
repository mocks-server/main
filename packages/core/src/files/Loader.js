class Loader {
  constructor({ id, alerts, logger, src, onLoad }) {
    this._id = id;
    this._logger = logger;
    this._alerts = alerts;
    this._src = src;
    this._onLoad = onLoad;
  }

  load(filesContents, fileErrors, tools) {
    return this._onLoad(filesContents, fileErrors, tools);
  }

  get logger() {
    return this._logger;
  }

  get alerts() {
    return this._alerts;
  }

  get id() {
    return this._id;
  }

  get src() {
    return this._src;
  }
}

module.exports = Loader;
