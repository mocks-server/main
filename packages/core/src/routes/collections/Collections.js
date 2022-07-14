const OPTIONS = [
  {
    description: "Selected collection",
    name: "selected",
    type: "string",
    // LEGACY, remove and set value from scaffold when legacy option is removed
    default: "base",
  },
];

class Collections {
  static get id() {
    return "collections";
  }

  constructor({ logger, config, onChangeSelected }) {
    this._logger = logger;
    this._config = config;
    this._onChangeSelected = onChangeSelected;

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(onChangeSelected);
  }
}

module.exports = Collections;
