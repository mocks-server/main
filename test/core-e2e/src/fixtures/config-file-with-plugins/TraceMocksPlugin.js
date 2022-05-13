class Plugin {
  static get id() {
    return "trace-mocks";
  }

  constructor({ core, config }) {
    this._traceMocks = config.addOption({
      name: "traceMocks",
      type: "boolean",
      description: "Trace mocks count",
      default: true,
    });
    this._traceMocks.onChange(this._onChangeTraceMocks.bind(this));

    this._core = core;
    this._onChangeMocks = this._onChangeMocks.bind(this);
  }

  get displayName() {
    return "trace-mocks";
  }

  init({ core }) {
    this._enabled = this._traceMocks.value;
    this._removeChangeMocksListener = core.onChangeMocks(this._onChangeMocks);
    core.tracer.debug(`traceMocks initial value is ${this._traceMocks.value}`);
  }

  traceMocks() {
    if (this._enabled && this._started) {
      this._core.tracer.info(`There are ${this._core.mocks.plainMocks.length} mocks available`);
    }
  }

  start({ core }) {
    this._started = true;
    core.tracer.debug("traceMocks plugin started");
    this.traceMocks();
  }

  stop({ core }) {
    this._started = false;
    core.tracer.debug("traceMocks plugin stopped");
  }

  _onChangeTraceMocks() {
    this._enabled = this._traceMocks.value;
  }

  _onChangeMocks() {
    this.traceMocks();
  }
}

module.exports = Plugin;
