const deepMerge = require("deepmerge");
const { isUndefined } = require("lodash");

class Option {
  constructor(properties) {
    // TODO, validate properties
    this._name = properties.name;
    this._type = properties.type;
    this._default = properties.default;
    this._value = this._default;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get default() {
    return this._default;
  }

  get value() {
    return this._value;
  }

  merge(value) {
    this._value = deepMerge(this._value || {}, value || {});
  }

  set value(value) {
    if (!isUndefined(value)) {
      this._value = value;
    }
  }
}

module.exports = Option;
