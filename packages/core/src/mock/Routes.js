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

  constructor({ logger, config }) {
    this._logger = logger;
    this._config = config;

    [this._delayOption] = this._config.addOptions(OPTIONS);
  }
}

module.exports = Routes;
