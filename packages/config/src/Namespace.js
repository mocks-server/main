const Option = require("./Option");
const { types } = require("./types");

class Namespace {
  constructor(name, options = {}) {
    this._schema = options.schema;
    this._name = name;
    this._options = new Set();
  }

  addOption(optionProperties) {
    const option = new Option(optionProperties);
    this._options.add(option);
    return option;
  }

  addOptions(options) {
    return options.map((option) => this.addOption(option));
  }

  init(configuration) {
    if (configuration) {
      this._options.forEach((option) => {
        if (option.type === types.OBJECT) {
          option.merge(configuration[option.name]);
        } else {
          option.value = configuration[option.name];
        }
      });
    }
  }

  get name() {
    return this._name;
  }

  get options() {
    return this._options;
  }
}

module.exports = Namespace;
