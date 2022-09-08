const OPTIONS = [
  {
    description: "Global delay to apply to routes",
    name: "delay",
    type: "number",
    default: 0,
  },
];

// TODO, add to data model

class Routes {
  static get id() {
    return "routes";
  }

  constructor({ logger, config, onChangeDelay, getPlainRoutes, getPlainVariants }) {
    this._logger = logger;
    this._config = config;

    this._getPlainRoutes = getPlainRoutes;
    this._getPlainVariants = getPlainVariants;

    [this._delayOption] = this._config.addOptions(OPTIONS);
    this._delayOption.onChange(onChangeDelay);
  }

  get plain() {
    return this._getPlainRoutes();
  }

  get plainVariants() {
    return this._getPlainVariants();
  }

  get delay() {
    return this._delayOption.value;
  }
}

module.exports = Routes;
