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
    this.loadMocks = loadMocks; //add to core?
    this.loadRoutes = loadRoutes; //add to core?
    this.config = config; //add to core?
    this.alerts = alerts; //add to core when legacy core alerts are removed
    this.logger = logger; //add to core?

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

  get tracer() {
    return this._core.tracer;
  }

  get logs() {
    return this._core.logs;
  }
}

module.exports = CustomCore;
