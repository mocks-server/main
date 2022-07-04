class Plugin {
  static get id() {
    return "trace-routes";
  }

  constructor({ mocks, config, logger }) {
    this._traceRoutes = config.addOption({
      name: "traceRoutes",
      type: "boolean",
      description: "Trace routes count",
      default: true,
    });
    this._traceRoutes.onChange(this._onChangeTraceRoutes.bind(this));

    this._mocks = mocks;
    this._onChangeMocks = this._onChangeMocks.bind(this);
    this._logger = logger;
  }

  get displayName() {
    return "trace-routes";
  }

  init({ onChangeMocks, logger }) {
    this._enabled = this._traceRoutes.value;
    this._removeChangeMocksListener = onChangeMocks(this._onChangeMocks);
    logger.debug(`traceRoutes initial value is ${this._traceRoutes.value}`);
  }

  traceRoutes() {
    if (this._enabled && this._started) {
      this._logger.info(`There are ${this._mocks.plainRoutes.length} routes available`);
    }
  }

  start() {
    this._started = true;
    this._logger.debug("traceRoutes plugin started");
    this.traceRoutes();
  }

  stop() {
    this._started = false;
    this._logger.debug("traceRoutes plugin stopped");
  }

  _onChangeTraceRoutes() {
    this._enabled = this._traceRoutes.value;
  }

  _onChangeMocks() {
    this.traceRoutes();
  }
}

module.exports = Plugin;
