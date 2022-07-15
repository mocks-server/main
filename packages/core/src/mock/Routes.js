const OPTIONS = [
  {
    description: "Global delay to apply to routes",
    name: "delay",
    type: "number",
    default: 0,
  },
];

class Routes {
  static get id() {
    return "routes";
  }

  constructor({ logger, config, onChangeDelay }) {
    this._logger = logger;
    this._config = config;

    [this._delayOption] = this._config.addOptions(OPTIONS);
    this._delayOption.onChange(onChangeDelay);
  }
}

module.exports = Routes;
