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

  constructor({
    logger,
    config,
    onChangeSelected,
    getIds,
    getSelectedCollection,
    getPlainCollections,
  }) {
    this._logger = logger;
    this._config = config;
    this._onChangeSelected = onChangeSelected;
    this._getSelectedCollection = getSelectedCollection;
    this._getPlainCollections = getPlainCollections;
    this._getIds = getIds;

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(onChangeSelected);
  }

  get selected() {
    return this._getSelectedCollection();
  }

  get ids() {
    return this._getIds();
  }

  get plain() {
    return this._getPlainCollections();
  }

  select(collection) {
    this._selectedOption.value = collection;
  }
}

module.exports = Collections;
