class Plugin {
  constructor(core) {
    core.addSetting({
      name: "traceMocks2",
      type: "boolean",
      description: "Trace mocks changes",
      default: true,
    });

    this._core = core;
    this._onChangeLegacyMocks = this._onChangeLegacyMocks.bind(this);
    this._onChangeSettings = this._onChangeSettings.bind(this);
  }

  get displayName() {
    return "trace-mocks";
  }

  init(core) {
    this._enabled = core.settings.get("traceMocks2");
    this._removeChangeMocksListener = core.onChangeLegacyMocks(this.onChangeLegacyMocks);
    this._removeChangeSettingsListener = core.onChangeSettings(this.onChangeSettings);
    core.tracer.debug(`traceMocks2 initial value is ${core.settings.get("traceMocks2")}`);
  }

  traceBehaviors() {
    if (this._enabled && this._started) {
      this._core.tracer.info(`Hey!, ${this._core.behaviors.count} behaviors available`);
    }
  }

  start(core) {
    this._started = true;
    core.tracer.debug("traceMocks2 plugin started");
    this.traceBehaviors();
  }

  stop(core) {
    this._started = false;
    core.tracer.debug("traceMocks2 plugin stopped");
  }

  _onChangeSettings(settings) {
    if (settings.hasOwnProperty("traceMocks2")) {
      this._enabled = settings.traceMocks2;
    }
  }

  _onChangeLegacyMocks() {
    this.traceBehaviors();
  }
}

module.exports = Plugin;
