class Option {
  constructor(properties) {
    // TODO, validate properties
    this._name = properties.name;
  }

  get name() {
    return this._name;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    // TODO, validate
    this._value = value;
  }
}

module.exports = Option;
