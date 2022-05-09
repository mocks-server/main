const EventEmitter = require("events");

const deepMerge = require("deepmerge");
const { isUndefined, isEqual } = require("lodash");

const { validateOption, validateValueType } = require("./validation");
const { addEventListener, CHANGE } = require("./events");
const { types } = require("./types");

class Option {
  constructor(properties) {
    this._eventEmitter = new EventEmitter();
    validateOption(properties);
    this._name = properties.name;
    this._metaData = properties.metaData;
    this._type = properties.type;
    this._itemsType = properties.itemsType;
    this._default = this._clone(properties.default);
    this._value = this._default;
    this._eventsStarted = false;
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

  get itemsType() {
    return this._itemsType;
  }

  get default() {
    return this._clone(this._default);
  }

  get value() {
    return this._clone(this._value);
  }

  _clone(value) {
    if (isUndefined(value)) {
      return value;
    }
    if (this._type === types.ARRAY) {
      return [...value];
    }
    if (this._type === types.OBJECT) {
      return { ...value };
    }
    return value;
  }

  _validate(value) {
    validateValueType(value, this._type, this._itemsType);
  }

  _emitChange(previousValue, value) {
    if (this._eventsStarted && !isEqual(previousValue, value)) {
      this._eventEmitter.emit(CHANGE, this._clone(value));
    }
  }

  onChange(listener) {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  merge(value) {
    const previousValue = this._value;
    const valueToSet = isUndefined(value) ? {} : value;
    this._validate(valueToSet);
    this._value = deepMerge(this._value || {}, valueToSet);
    this._emitChange(previousValue, this._value);
  }

  set value(value) {
    const previousValue = this._value;
    if (!isUndefined(value)) {
      this._validate(value);
      this._value = this._clone(value);
      this._emitChange(previousValue, this._value);
    }
  }

  startEvents() {
    this._eventsStarted = true;
  }
}

module.exports = Option;
