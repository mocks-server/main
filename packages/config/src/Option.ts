import EventEmitter from "events";

import deepMerge from "deepmerge";
import { isUndefined, isEqual } from "lodash";

import { validateOptionAndThrow, validateValueTypeAndThrow } from "./validation";
import { addEventListener, CHANGE } from "./events";
import { typeIsArray, typeIsObject, avoidArraysMerge } from "./types";

import type { OptionInterface, OptionProperties, ItemsType, OptionType, OptionValue, SetMethodOptions, OptionArrayValue, ExtraData } from "./types/Option";
import type { EventListener, EventListenerRemover } from "./types/Events";
import type { AnyObject } from "./types/Common";

class Option implements OptionInterface {
  private _eventEmitter: EventEmitter
  private _name: string
  private _nullable: boolean
  private _extraData?: ExtraData
  private _type: OptionType
  private _description: string | undefined
  private _itemsType?: ItemsType
  private _default: OptionValue
  private _value: OptionValue
  private _eventsStarted: boolean
  private _hasBeenSet: boolean

  constructor(optionProperties: OptionProperties) {
    this._eventEmitter = new EventEmitter();
    this._name = optionProperties.name;
    this._nullable = Boolean(optionProperties.nullable);
    this._extraData = optionProperties.extraData;
    this._type = optionProperties.type;
    this._description = optionProperties.description;
    this._itemsType = optionProperties.itemsType;
    this._default = this._clone(optionProperties.default);
    this._value = this._default;
    this._eventsStarted = false;
    this._hasBeenSet = false;

    validateOptionAndThrow({ ...optionProperties, nullable: this._nullable });
  }

  public get name(): string {
    return this._name;
  }

  public get type(): OptionType {
    return this._type;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get default(): OptionValue {
    return this._clone(this._default);
  }

  public get value(): OptionValue {
    return this._clone(this._value);
  }

  public set value(value) {
    this.set(value);
  }

  public get nullable(): boolean {
    return this._nullable;
  }

  public get extraData(): AnyObject | undefined {
    return this._extraData;
  }

  public get itemsType(): ItemsType | undefined {
    return this._itemsType;
  }

  private _clone(value: OptionValue): OptionValue {
    if (isUndefined(value)) {
      return value;
    }
    if (typeIsArray(this._type)) {
      return [...value as OptionArrayValue] as OptionArrayValue;
    }
    if (typeIsObject(this._type)) {
      return { ...value as AnyObject };
    }
    return value;
  }

  private _validateAndThrow(value: OptionValue) {
    validateValueTypeAndThrow(value, this._type, this._nullable, this._itemsType);
  }

  private _emitChange(previousValue: OptionValue, value: OptionValue) {
    if (this._eventsStarted && !isEqual(previousValue, value)) {
      this._eventEmitter.emit(CHANGE, this._clone(value));
    }
  }

  public onChange(listener: EventListener): EventListenerRemover {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  private _merge(value: OptionValue) {
    const previousValue = this._value;
    this._validateAndThrow(value);
    this._value = deepMerge((this._value || {}) as AnyObject, value as AnyObject, { arrayMerge: avoidArraysMerge });
    this._emitChange(previousValue, this._value);
  }

  public set(value: OptionValue, { merge = false } : SetMethodOptions = {}): void {
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

  public startEvents() {
    this._eventsStarted = true;
  }

  public get hasBeenSet() {
    return this._hasBeenSet;
  }
}

export default Option;
