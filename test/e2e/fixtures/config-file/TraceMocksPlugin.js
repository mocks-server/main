class Plugin {
  constructor(core) {
    core.addSetting({
      name: "traceMocks",
      type: "boolean",
      description: "Trace mocks changes",
      default: true,
    });

    this._core = core;
    this._onChangeMocks = this._onChangeMocks.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  get displayName() {
    return "trace-mocks";
  }

  init(core) {
    this._enabled = core.settings.get("traceMocks");
    this._removeChangeMocksListener = core.onChangeMocks(this._onChangeMocks);
    this._removeChangeSettingsListener = core.onChangeSettings(this._onChangeSettings);
    core.tracer.debug(`traceMocks initial value is ${core.settings.get("traceMocks")}`);
  }

  traceBehaviors() {
    if (this._enabled && this._started) {
      this._core.tracer.info(`There are ${this._core.behaviors.count} behaviors available`);
    }
  }

  start(core) {
    this._started = true;
    core.tracer.debug("traceMocks plugin started");
    this.traceBehaviors();
  }

  stop(core) {
    this._started = false;
    core.tracer.debug("traceMocks plugin stopped");
  }

  _onChangeSettings(settings) {
    if (settings.hasOwnProperty("traceMocks")) {
      this._enabled = settings.traceMocks;
    }
  }

  _onChangeMocks() {
    this.traceBehaviors();
  }
}

module.exports = Plugin;
