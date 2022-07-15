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

  constructor({ logger, config, onChangeDelay, getPlainRoutes }) {
    this._logger = logger;
    this._config = config;

    this._getPlainRoutes = getPlainRoutes;

    [this._delayOption] = this._config.addOptions(OPTIONS);
    this._delayOption.onChange(onChangeDelay);
  }

  get plain() {
    return this._getPlainRoutes();
  }
}

module.exports = Routes;
