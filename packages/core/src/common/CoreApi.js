const CORE_METHODS = ["start", "stop"];

function cloneMethods(origin, dest) {
  CORE_METHODS.forEach((methodName) => {
    dest[methodName] = origin[methodName].bind(origin);
  });
}

class CoreApi {
  constructor({ core, config, alerts, logger }) {
    this._core = core;

    // Add core methods
    cloneMethods(this._core, this);

    this._config = config;
    this._alerts = alerts;
    this._logger = logger;
  }

  get config() {
    return this._config;
  }

  get alerts() {
    return this._alerts;
  }

  get logger() {
    return this._logger;
  }

  get server() {
    return this._core.server;
  }

  get files() {
    return this._core.files;
  }

  get mock() {
    return this._core.mock;
  }

  get variantHandlers() {
    return this._core.variantHandlers;
  }

  get version() {
    return this._core.version;
  }
}

module.exports = CoreApi;
