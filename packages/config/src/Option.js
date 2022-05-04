const EventEmitter = require("events");

const deepMerge = require("deepmerge");
const { isUndefined, isEqual } = require("lodash");

const { validateOption, validateValueType } = require("./validation");
const { addEventListener, CHANGE } = require("./events");

class Option {
  constructor(properties) {
    this._eventEmitter = new EventEmitter();
    validateOption(properties);
    this._name = properties.name;
    this._metaData = properties.metaData;
    this._type = properties.type;
    this._default = properties.default;
    this._value = this._default;
  }

  get metaData() {
    return this._metaData;
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

  _emitChange(previousValue, value) {
    if (!isEqual(previousValue, value)) {
      this._eventEmitter.emit(CHANGE, value);
    }
  }

  onChange(listener) {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  merge(value) {
    const previousValue = this._value;
    const valueToSet = isUndefined(value) ? {} : value;
    this.validate(valueToSet);
    this._value = deepMerge(this._value || {}, valueToSet);
    this._emitChange(previousValue, this._value);
  }

  set value(value) {
    const previousValue = this._value;
    if (!isUndefined(value)) {
      this.validate(value);
      this._value = value;
      this._emitChange(previousValue, this._value);
    }
  }
}

module.exports = Option;
