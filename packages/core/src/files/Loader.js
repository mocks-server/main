class Loader {
  constructor({ id, alerts, logger, src, onLoad }) {
    this._id = id;
    this._logger = logger;
    this._alerts = alerts;
    this._src = src;
    this._onLoad = onLoad;
  }

  load(filesContents, fileErrors) {
    return this._onLoad(filesContents, fileErrors, {
      alerts: this.alerts,
      logger: this.logger,
    });
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
