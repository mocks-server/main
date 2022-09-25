import type { ObjectWithName, AnyObject } from "./Common";
import type { EventListener, EventListenerRemover } from "./Events";

export type OptionType = "string" | "number" | "boolean" | "object" | "array" | "null";
export type ItemsType = "string" | "number" | "boolean" | "object";

export type OptionSingleValue = boolean | number | string | AnyObject | null | undefined
export type OptionArrayValue = boolean[] | number[] | string[] | AnyObject[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionValue = any

export type ExtraData = AnyObject;

export interface BaseOptionProperties  extends ObjectWithName {
  name: string
  type: OptionType
  description?: string
  default?: OptionValue
  value?: OptionValue
  nullable?: boolean
  extraData?: ExtraData
  itemsType?: ItemsType
}

export interface OptionBooleanProperties extends BaseOptionProperties {
  type: "boolean"
  value?: boolean
  default?: boolean
  itemsType?: undefined
}

export interface OptionNumberProperties extends BaseOptionProperties {
  type: "number"
  value?: number
  default?: number
  itemsType?: undefined
}

export interface OptionStringProperties extends BaseOptionProperties {
  type: "string"
  value?: string
  default?: string
  itemsType?: undefined
}

export interface OptionObjectProperties extends BaseOptionProperties {
  type: "object"
  value?: AnyObject
  default?: AnyObject
  itemsType?: undefined
}

export interface OptionArrayProperties extends BaseOptionProperties {
  type: "array"
  value?: OptionArrayValue
  itemsType: ItemsType
  default?: OptionArrayValue
}

export interface OptionNullProperties extends BaseOptionProperties {
  type: "null"
  value?: null
  default?: null
  itemsType?: undefined
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
  type: "array"
  value?: OptionArrayValue
  itemsType: ItemsType
  default?: OptionArrayValue
}

export interface OptionInterfaceBoolean extends OptionInterface {
  type: "boolean"
  value?: boolean
  default?: boolean
}

export interface SetMethodOptions {
  merge?: boolean
}
