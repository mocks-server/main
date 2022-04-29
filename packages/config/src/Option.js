const { isUndefined } = require("lodash");

class Option {
  constructor(properties) {
    // TODO, validate properties
    this._name = properties.name;
    this._default = properties.default;
  }

  get name() {
    return this._name;
  }

  get value() {
    return isUndefined(this._value) ? this._default : this._value;
  }

  set value(value) {
    if (!isUndefined(value)) {
      this._value = value;
    }
  }
}

module.exports = Option;
