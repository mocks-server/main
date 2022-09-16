import EventEmitter from "events";

import deepMerge from "deepmerge";
import { isUndefined, isEqual } from "lodash";

import { validateOptionAndThrow, validateValueTypeAndThrow } from "./validation";
import { addEventListener, CHANGE } from "./events";
import { typeIsArray, typeIsObject, avoidArraysMerge } from "./types";

class Option {
  constructor(properties) {
    this._eventEmitter = new EventEmitter();
    this._name = properties.name;
    this._nullable = Boolean(properties.nullable);
    this._extraData = properties.extraData;
    this._type = properties.type;
    this._description = properties.description;
    this._itemsType = properties.itemsType;
    this._default = this._clone(properties.default);
    this._value = this._default;
    this._eventsStarted = false;
    this._hasBeenSet = false;

    validateOptionAndThrow({ ...properties, nullable: this._nullable });
  }

  get extraData() {
    return this._extraData;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get type() {
    return this._type;
  }

  get nullable() {
    return this._nullable;
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

  set value(value) {
    this.set(value);
  }

  _clone(value) {
    if (isUndefined(value)) {
      return value;
    }
    if (typeIsArray(this._type)) {
      return [...value];
    }
    if (typeIsObject(this._type)) {
      return { ...value };
    }
    return value;
  }

  _validateAndThrow(value) {
    validateValueTypeAndThrow(value, this._type, this._nullable, this._itemsType);
  }

  _emitChange(previousValue, value) {
    if (this._eventsStarted && !isEqual(previousValue, value)) {
      this._eventEmitter.emit(CHANGE, this._clone(value));
    }
  }

  onChange(listener) {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  _merge(value) {
    const previousValue = this._value;
    this._validateAndThrow(value);
    this._value = deepMerge(this._value || {}, value, { arrayMerge: avoidArraysMerge });
    this._emitChange(previousValue, this._value);
  }

  set(value, { merge = false } = {}) {
    if (!isUndefined(value)) {
      this._hasBeenSet = true;
      if (merge && typeIsObject(this.type)) {
        this._merge(value);
      } else {
        const previousValue = this._value;
        this._validateAndThrow(value);
        this._value = this._clone(value);
        this._emitChange(previousValue, this._value);
      }
    }
  }

  startEvents() {
    this._eventsStarted = true;
  }

  get hasBeenSet() {
    return this._hasBeenSet;
  }
}

export default Option;
