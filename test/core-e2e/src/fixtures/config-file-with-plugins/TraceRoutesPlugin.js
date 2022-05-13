class Plugin {
  static get id() {
    return "trace-routes";
  }

  constructor({ core, config }) {
    this._traceRoutes = config.addOption({
      name: "traceRoutes",
      type: "boolean",
      description: "Trace routes count",
      default: true,
    });
    this._traceRoutes.onChange(this._onChangeTraceRoutes.bind(this));

    this._core = core;
    this._onChangeMocks = this._onChangeMocks.bind(this);
  }

  get displayName() {
    return "trace-routes";
  }

  init({ core }) {
    this._enabled = this._traceRoutes.value;
    this._removeChangeMocksListener = core.onChangeMocks(this._onChangeMocks);
    core.tracer.debug(`traceRoutes initial value is ${this._traceRoutes.value}`);
  }

  traceRoutes() {
    if (this._enabled && this._started) {
      this._core.tracer.info(`There are ${this._core.mocks.plainRoutes.length} routes available`);
    }
  }

  start({ core }) {
    this._started = true;
    core.tracer.debug("traceRoutes plugin started");
    this.traceRoutes();
  }

  stop({ core }) {
    this._started = false;
    core.tracer.debug("traceRoutes plugin stopped");
  }

  _onChangeTraceRoutes() {
    this._enabled = this._traceRoutes.value;
  }

  _onChangeMocks() {
    this.traceRoutes();
  }
}

module.exports = Plugin;
