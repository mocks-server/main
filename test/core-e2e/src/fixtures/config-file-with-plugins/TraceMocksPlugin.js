class Plugin {
  static get id() {
    return "trace-mocks";
  }

  constructor({ mocks, config, logger }) {
    this._traceMocks = config.addOption({
      name: "traceMocks",
      type: "boolean",
      description: "Trace mocks count",
      default: true,
    });
    this._traceMocks.onChange(this._onChangeTraceMocks.bind(this));

    this._mocks = mocks;
    this._onChangeMocks = this._onChangeMocks.bind(this);
    this._logger = logger;
  }

  get displayName() {
    return "trace-mocks";
  }

  init({ onChangeMocks, logger }) {
    this._enabled = this._traceMocks.value;
    this._removeChangeMocksListener = onChangeMocks(this._onChangeMocks);
    logger.debug(`traceMocks initial value is ${this._traceMocks.value}`);
  }

  traceMocks() {
    if (this._enabled && this._started) {
      this._logger.info(`There are ${this._mocks.plainMocks.length} mocks available`);
    }
  }

  start() {
    this._started = true;
    this._logger.debug("traceMocks plugin started");
    this.traceMocks();
  }

  stop() {
    this._started = false;
    this._logger.debug("traceMocks plugin stopped");
  }

  _onChangeTraceMocks() {
    this._enabled = this._traceMocks.value;
  }

  _onChangeMocks() {
    this.traceMocks();
  }
}

module.exports = Plugin;
