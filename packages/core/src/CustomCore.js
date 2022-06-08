const CORE_METHODS = [
  "start",
  "stop",
  "addRoutesHandler",
  "onChangeMocks",
  "onChangeAlerts",
  "onChangeLogs",
  "restartServer",
  "addRouter",
  "removeRouter",
  "loadMocks",
  "loadRoutes",
];

function cloneMethods(origin, dest) {
  CORE_METHODS.forEach((methodName) => {
    dest[methodName] = origin[methodName].bind(origin);
  });
}

class CustomCore {
  constructor({
    core,
    loadMocks,
    loadRoutes,
    addAlert,
    removeAlerts,
    renameAlerts,
    config,
    alerts,
    logger,
  }) {
    this._core = core;

    // Add core methods
    cloneMethods(this._core, this);

    // Add custom methods
    if (loadMocks) {
      this.loadMocks = loadMocks;
    }
    if (loadRoutes) {
      this.loadRoutes = loadRoutes;
    }

    this._config = config;
    this._alerts = alerts;
    this._logger = logger;

    // LEGACY, to be removed
    this.addAlert = addAlert;
    this.removeAlerts = removeAlerts;
    this.renameAlerts = renameAlerts;
  }

  // LEGACY. To be removed
  get core() {
    // Add alert here if the property is used
    return this._core;
  }

  get mocks() {
    return this._core.mocks;
  }

  // LEGACY. To be removed
  get tracer() {
    // Add alert here if the property is used
    return this._core.tracer;
  }

  get logs() {
    return this._core.logs;
  }

  get config() {
    return this._config || this._core.config;
  }

  get alerts() {
    return this._alerts;
  }

  get logger() {
    return this._logger;
  }
}

module.exports = CustomCore;
