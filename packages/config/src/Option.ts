import EventEmitter from "events";

import deepMerge from "deepmerge";
import { isUndefined, isEqual } from "lodash";

import type { UnknownObject } from "./Common.types";
import { addEventListener, CHANGE } from "./Events";
import type { EventListener, EventListenerRemover } from "./Events.types";
import type {
  OptionInterface,
  OptionDefinitionGeneric,
  SetMethodOptions,
  GetOptionValueTypeFromDefinition,
  GetOptionTypeFromDefinition,
} from "./Option.types";
import { typeIsArray, typeIsObject, optionIsObject, avoidArraysMerge } from "./Typing";
import { validateOptionAndThrow, validateValueTypeAndThrow } from "./Validation";

export class Option<T extends OptionDefinitionGeneric, TypeOfValue = void>
  implements OptionInterface<T, TypeOfValue>
{
  private _eventEmitter: EventEmitter;
  private _name: T["name"];
  private _nullable: boolean;
  private _extraData?: T["extraData"];
  private _type: GetOptionTypeFromDefinition<T>["type"];
  private _description: T["description"];
  private _itemsType?: T["itemsType"];
  private _default: GetOptionValueTypeFromDefinition<T, TypeOfValue>;
  private _value: GetOptionValueTypeFromDefinition<T, TypeOfValue>;
  private _eventsStarted: boolean;
  private _hasBeenSet: boolean;

  constructor(optionProperties: T) {
    this._eventEmitter = new EventEmitter();
    this._name = optionProperties.name;
    this._nullable = Boolean(optionProperties.nullable);
    this._extraData = optionProperties.extraData;
    this._type = optionProperties.type;
    this._description = optionProperties.description;
    this._itemsType = optionProperties.itemsType;
    this._default = this._clone(
      optionProperties.default as GetOptionValueTypeFromDefinition<T, TypeOfValue>
    );
    this._value = this._default;
    this._eventsStarted = false;
    this._hasBeenSet = false;

    validateOptionAndThrow({
      ...optionProperties,
      nullable: this._nullable,
    } as OptionDefinitionGeneric);
  }

  public get name(): string {
    return this._name;
  }

  public get type(): T["type"] {
    return this._type;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get default(): GetOptionValueTypeFromDefinition<T, TypeOfValue> {
    return this._clone(this._default);
  }

  public get value(): GetOptionValueTypeFromDefinition<T, TypeOfValue> {
    return this._clone(this._value);
  }

  public set value(value: GetOptionValueTypeFromDefinition<T, TypeOfValue>) {
    this.set(value);
  }

  public get nullable(): boolean {
    return this._nullable;
  }

  public get extraData(): UnknownObject | undefined {
    return this._extraData;
  }

  public get itemsType(): T["itemsType"] | undefined {
    return this._itemsType;
  }

  private _clone(
    value: GetOptionValueTypeFromDefinition<T, TypeOfValue>
  ): GetOptionValueTypeFromDefinition<T, TypeOfValue> {
    if (isUndefined(value)) {
      return value;
    }
    if (typeIsArray(this._type)) {
      const clonedValue = [...(value as unknown[])];
      return clonedValue as GetOptionValueTypeFromDefinition<T, TypeOfValue>;
    }
    if (optionIsObject(this as unknown as OptionInterface<OptionDefinitionGeneric>)) {
      const clonedValue = { ...(value as unknown as UnknownObject) };
      return clonedValue as GetOptionValueTypeFromDefinition<T, TypeOfValue>;
    }
    return value;
  }

  private _validateAndThrow(value: GetOptionValueTypeFromDefinition<T, TypeOfValue>) {
    validateValueTypeAndThrow(value, this._type, this._nullable, this._itemsType);
  }

  private _emitChange(
    previousValue: GetOptionValueTypeFromDefinition<T, TypeOfValue>,
    value: GetOptionValueTypeFromDefinition<T, TypeOfValue>
  ) {
    if (this._eventsStarted && !isEqual(previousValue, value)) {
      this._eventEmitter.emit(CHANGE, this._clone(value));
    }
  }

  public onChange(listener: EventListener): EventListenerRemover {
    return addEventListener(listener, CHANGE, this._eventEmitter);
  }

  private _merge(value: GetOptionValueTypeFromDefinition<T, TypeOfValue>) {
    const previousValue = this._value;
    this._validateAndThrow(value);
    this._value = deepMerge((this._value || {}) as UnknownObject, value as UnknownObject, {
      arrayMerge: avoidArraysMerge,
    }) as GetOptionValueTypeFromDefinition<T, TypeOfValue>;
    this._emitChange(previousValue, this._value);
  }

  public set(
    value: GetOptionValueTypeFromDefinition<T, TypeOfValue>,
    { merge = false }: SetMethodOptions = {}
  ): void {
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

/* const foo: OptionInterface<> = new Option({
  name: "foo",
  type: "string",
  default: "bar",
  nullable: true,
  description: "foo description",
}); */
