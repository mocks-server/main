class Namespace {
  constructor(name) {
    this._name = name;
    this._options = new Set();
  }

  addOption(optionProperties) {
    this._options.add(optionProperties);
  }

  addOptions(options) {
    return options.map((option) => this.addOption(option));
  }

  init(configuration) {
    if (configuration[this._name]) {
      this._options.forEach((option) => {
        option.value = configuration[this._name][option.name];
      });
    }
  }
}

module.exports = Namespace;
