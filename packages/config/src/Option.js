const deepMerge = require("deepmerge");
const { isUndefined } = require("lodash");

const { validateOption, validateValueType } = require("./validation");

class Option {
  constructor(properties) {
    validateOption(properties);
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

  validate(value) {
    validateValueType(value, this._type);
  }

  merge(value) {
    const valueToSet = isUndefined(value) ? {} : value;
    this.validate(valueToSet);
    this._value = deepMerge(this._value || {}, valueToSet);
  }

  set value(value) {
    if (!isUndefined(value)) {
      this.validate(value);
      this._value = value;
    }
  }
}

module.exports = Option;
