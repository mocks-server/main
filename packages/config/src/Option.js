const { isUndefined } = require("lodash");

class Option {
  constructor(properties) {
    // TODO, validate properties
    this._name = properties.name;
    this._type = properties.type;
    this._default = properties.default;
    this._parser = properties.parser;
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
    return isUndefined(this._value) ? this._default : this._value;
  }

  get parser() {
    return this._parser;
  }

  set value(value) {
    if (!isUndefined(value)) {
      this._value = value;
    }
  }
}

module.exports = Option;
