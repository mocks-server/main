class Plugin {
  static get id() {
    return "trace-routes";
  }

  constructor({ mock, config, logger }) {
    this._traceRoutes = config.addOption({
      name: "traceRoutes",
      type: "boolean",
      description: "Trace routes count",
      default: true,
    });
    this._traceRoutes.onChange(this._onChangeTraceRoutes.bind(this));

    this._mock = mock;
    this._onChangeMock = this._onChangeMock.bind(this);
    this._logger = logger;
  }

  get displayName() {
    return "trace-routes";
  }

  init({ mock, logger }) {
    this._enabled = this._traceRoutes.value;
    this._removeChangeMocksListener = mock.onChange(this._onChangeMock);
    logger.debug(`traceRoutes initial value is ${this._traceRoutes.value}`);
  }

  traceRoutes() {
    if (this._enabled && this._started) {
      this._logger.info(`There are ${this._mock.routes.plain.length} routes available`);
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

  _onChangeMock() {
    this.traceRoutes();
  }
}

module.exports = Plugin;
