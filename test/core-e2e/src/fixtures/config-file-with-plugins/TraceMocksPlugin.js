class Plugin {
  static get id() {
    return "trace-mocks";
  }

  constructor({ mock, config, logger }) {
    this._traceMocks = config.addOption({
      name: "traceMocks",
      type: "boolean",
      description: "Trace mocks count",
      default: true,
    });
    this._traceMocks.onChange(this._onChangeTraceMocks.bind(this));

    this._mock = mock;
    this._onChangeMock = this._onChangeMock.bind(this);
    this._logger = logger;
  }

  get displayName() {
    return "trace-mocks";
  }

  init() {
    this._enabled = this._traceMocks.value;
    this._removeChangeMockListener = this._mock.onChange(this._onChangeMock);
    this._logger.debug(`traceMocks initial value is ${this._traceMocks.value}`);
  }

  traceMocks() {
    if (this._enabled && this._started) {
      this._logger.info(`There are ${this._mock.collections.plain.length} mocks available`);
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

  _onChangeMock() {
    this.traceMocks();
  }
}

module.exports = Plugin;
