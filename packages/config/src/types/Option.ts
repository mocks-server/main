import type { ObjectWithName, AnyObject } from "./Common";
import type { EventListener, EventListenerRemover } from "./Events";

const STRING_TYPE = "string";
const NUMBER_TYPE = "number";
const BOOLEAN_TYPE = "boolean";
const OBJECT_TYPE = "object";
const ARRAY_TYPE = "array";
const NULL_TYPE = "null";

export const types = {
  STRING: STRING_TYPE,
  NUMBER: NUMBER_TYPE,
  BOOLEAN: BOOLEAN_TYPE,
  OBJECT: OBJECT_TYPE,
  ARRAY: ARRAY_TYPE,
  NULL: NULL_TYPE,
}

export type OptionType = typeof types.STRING | typeof types.NUMBER | typeof types.BOOLEAN | typeof types.OBJECT | typeof types.ARRAY | typeof types.NULL;
export type ItemsType = typeof types.STRING | typeof types.NUMBER | typeof types.BOOLEAN | typeof types.OBJECT;

export type OptionSingleValue = boolean | number | string | AnyObject | null | undefined
export type OptionArrayValue = boolean[] | number[] | string[] | AnyObject[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionValue = any

export type ExtraData = AnyObject;

export interface BaseOptionProperties  extends ObjectWithName {
  name: string
  type: ItemsType | OptionType
  description?: string
  default?: OptionValue
  value?: OptionValue
  nullable?: boolean
  extraData?: ExtraData
  itemsType?: ItemsType
}

export interface OptionBooleanProperties extends BaseOptionProperties {
  type: typeof types.BOOLEAN
  value?: boolean
  default?: boolean
}

export interface OptionNumberProperties extends BaseOptionProperties {
  type: typeof types.NUMBER
  value?: number
  default?: number
}

export interface OptionStringProperties extends BaseOptionProperties {
  type: typeof types.STRING
  value?: string
  default?: string
}

export interface OptionObjectProperties extends BaseOptionProperties {
  type: typeof types.OBJECT
  value?: AnyObject
  default?: AnyObject
}

export interface OptionArrayProperties extends BaseOptionProperties {
  type: typeof types.ARRAY
  value?: OptionArrayValue
  itemsType: ItemsType
  default?: OptionArrayValue
}

export interface OptionNullProperties extends BaseOptionProperties {
  type: typeof types.NULL
  value?: null
  default?: null
}

export type OptionProperties = OptionBooleanProperties | OptionNumberProperties | OptionStringProperties | OptionObjectProperties | OptionArrayProperties | OptionNullProperties

export interface OptionConstructor {
  new (option: OptionProperties): OptionInterface
}

export interface OptionInterface extends BaseOptionProperties {
  onChange(eventListener: EventListener): EventListenerRemover
  set(value: OptionValue, options: SetMethodOptions): void
  startEvents(): void
  hasBeenSet: boolean
  nullable: boolean
}

export interface OptionInterfaceArray extends OptionInterface {
  type: typeof types.ARRAY
  value?: OptionArrayValue
  itemsType: ItemsType
  default?: OptionArrayValue
}

export interface OptionInterfaceBoolean extends OptionInterface {
  type: typeof types.BOOLEAN
  value?: boolean
  default?: boolean
}

export interface SetMethodOptions {
  merge?: boolean
}
