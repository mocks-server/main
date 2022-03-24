class Plugin {
  constructor(core) {
    core.addSetting({
      name: "traceRoutes",
      type: "boolean",
      description: "Trace routes count",
      default: true,
    });

    this._core = core;
    this._onChangeMocks = this._onChangeMocks.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  get displayName() {
    return "trace-routes";
  }

  init(core) {
    this._enabled = core.settings.get("traceRoutes");
    this._removeChangeMocksListener = core.onChangeMocks(this._onChangeMocks);
    this._removeChangeSettingsListener = core.onChangeSettings(this._onChangeSettings);
    core.tracer.debug(`traceRoutes initial value is ${core.settings.get("traceRoutes")}`);
  }

  traceRoutes() {
    if (this._enabled && this._started) {
      this._core.tracer.info(`There are ${this._core.mocks.plainRoutes.length} routes available`);
    }
  }

  start(core) {
    this._started = true;
    core.tracer.debug("traceRoutes plugin started");
    this.traceRoutes();
  }

  stop(core) {
    this._started = false;
    core.tracer.debug("traceRoutes plugin stopped");
  }

  _onChangeSettings(settings) {
    if (settings.hasOwnProperty("traceRoutes")) {
      this._enabled = settings.traceRoutes;
    }
  }

  _onChangeMocks() {
    this.traceRoutes();
  }
}

module.exports = Plugin;
