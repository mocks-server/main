import type { ObjectWithName, AnyObject } from "./Common";
import type { EventListener, EventListenerRemover } from "./Events";

/** Possible value types */
export type OptionType = "string" | "number" | "boolean" | "object" | "array" | "null";
/** Possible value types inside an array */
export type ItemsType = "string" | "number" | "boolean" | "object";

/** Possible types for the value of an option not being of type array */
export type OptionSingleValue = boolean | number | string | AnyObject | null | undefined

/** Possible types for the value of an option of type array */
export type OptionArrayValue = boolean[] | number[] | string[] | AnyObject[]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionValue = any

/** Extra data to store in the option interface */
export type ExtraData = AnyObject;

/** Properties for creating an option */
export interface BaseOptionProperties  extends ObjectWithName {
  /** Name for the option */
  name: string
  /** Type of the option value */
  type: OptionType
  /** Option description */
  description?: string
  /** Default value */
  default?: OptionValue
  /** Value is nullable */
  nullable?: boolean
  /** Extra data {@link ExtraData} */
  extraData?: ExtraData
  /** Type of the items in the value array when option type is array {@link ItemsType} */
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

/** Creates an option interface */
export interface OptionConstructor {
  /**
  * Creates an option interface
  * @param option - Option properties {@link OptionProperties}
  * @returns Option interface {@link OptionInterface}.
  * @example const option = new Option({ name: "foo", type: "string" })
  */
  new (option: OptionProperties): OptionInterface
}

/** Option interface */
export interface OptionInterface extends BaseOptionProperties {
  /**
  * Allows to execute a function whenever the option value changes
  * @param eventListener - Function to execute when the option value changes {@link EventListener}
  * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link EventListenerRemover}
  * @example const removeOnChangeListener = option.onChange(() => console.log("option value changed"))
  */
  onChange(eventListener: EventListener): EventListenerRemover
  /**
  * Set the value of the option
  * @param value - New value for the option
  * @param options - Options {@link SetMethodOptions}
  * @example option.set({ foo: 2 }, { merge: false })
  */
  set(value: OptionValue, options: SetMethodOptions): void
  /**
  * Start emitting events
  * @example option.startEvents()
  */
  startEvents(): void
  /** Current value */
  value?: OptionValue
  /** Option value has been already set or not (if not, it returns the default value) */
  hasBeenSet: boolean
  /** Option value can be set to null or not */
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

/** Options of the set method */
export interface SetMethodOptions {
  /** When passed value is an object, determines whether it has to be merged with previous value or not */
  merge?: boolean
}
