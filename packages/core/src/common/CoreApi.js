const { docsUrl } = require("./helpers");

const CORE_METHODS = [
  "start",
  "stop",
  // LEGACY, to be removed
  "addRoutesHandler",
  // LEGACY, to be removed
  "onChangeMocks",
  // LEGACY, to be removed
  "onChangeAlerts",
  // LEGACY, to be removed
  "onChangeLogs",
  // LEGACY, to be removed
  "restartServer",
  // LEGACY, to be removed
  "addRouter",
  // LEGACY, to be removed
  "removeRouter",
  // LEGACY, to be removed
  "loadMocks",
  // LEGACY, to be removed
  "loadRoutes",
];

function cloneMethods(origin, dest) {
  CORE_METHODS.forEach((methodName) => {
    dest[methodName] = origin[methodName].bind(origin);
  });
}

class CoreApi {
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
    this._deprecationAlerts = alerts
      ? alerts.collection("deprecated")
      : this._core._deprecationAlerts;
    this._logger = logger;

    // LEGACY, to be removed
    this.addAlert = addAlert;
    this.removeAlerts = removeAlerts;
    this.renameAlerts = renameAlerts;
  }

  // LEGACY. To be removed
  get core() {
    // TODO, add link to releases URL.
    this._deprecationAlerts.set(
      "core",
      `Usage of core property is deprecated. Use properties at first level instead: ${docsUrl(
        "releases/migrating-from-v3#plugins"
      )}`
    );
    return this._core;
  }

  // LEGACY, to be removed
  get mocks() {
    return this._core.mocks;
  }

  // LEGACY, to be removed
  get tracer() {
    return this._core.tracer;
  }

  // LEGACY, to be removed
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
