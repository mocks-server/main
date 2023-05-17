import type { Option } from "commander";

import type { ObjectWithName, UnknownObject } from "./Common.types";
import type { EventListener, EventListenerRemover } from "./Events.types";

/** Option name */
export type OptionName = string;

/** Option description */
export type OptionDescription = string;

/** Possible value types */
export type OptionType = "string" | "number" | "boolean" | "object" | "array" | "null";
/** Possible value types inside an array */
export type OptionItemsType = "string" | "number" | "boolean" | "object";

/** Possible types for the value of an option not being of type array */
export type OptionSingleValue = boolean | number | string | UnknownObject | null | undefined;

/** Possible types for the value of an option of type array */
export type OptionArrayValueContent = boolean | number | string | UnknownObject;

export type OptionArrayValue = boolean[] | number[] | string[] | UnknownObject[];

export type OptionValue = OptionSingleValue | OptionArrayValue;

/** Extra data to store in the option interface */
export type OptionExtraData = UnknownObject;

/** Properties for creating an option */
export interface OptionBase extends ObjectWithName {
  /** Name for the option */
  name: OptionName;
  /** Option description */
  description?: OptionDescription;
  /** Extra data {@link OptionExtraData} */
  extraData?: OptionExtraData;
  /** Option value is nullable */
  nullable?: boolean;
  /** Option default value */
  default?: OptionValue;
}

export type AddDefaultToOption<T, TValue> = T & {
  default: TValue;
};

export interface OptionBooleanProps {
  type: "boolean";
  itemsType?: undefined;
}

export type OptionBooleanPropsWithDefault = AddDefaultToOption<OptionBooleanProps, boolean>;

export interface OptionNumberProps {
  type: "number";
  itemsType?: undefined;
}

export type OptionNumberPropsWithDefault = AddDefaultToOption<OptionNumberProps, number>;

export interface OptionStringProps {
  type: "string";
  itemsType?: undefined;
}

export type OptionStringPropsWithDefault = AddDefaultToOption<OptionStringProps, string>;

export interface OptionObjectProps {
  type: "object";
  itemsType?: undefined;
}

export type OptionObjectPropsWithDefault = AddDefaultToOption<OptionObjectProps, UnknownObject>;

export interface OptionNullProps {
  type: "null";
  itemsType?: undefined;
}

export type OptionNullPropsWithDefault = AddDefaultToOption<OptionNullProps, null>;

export interface OptionArrayBaseProps<T extends OptionArrayValueContent> {
  type: "array";
  itemsType?: T extends boolean
    ? "boolean"
    : T extends number
    ? "number"
    : T extends string
    ? "string"
    : T extends UnknownObject
    ? "object"
    : never;
}

export type OptionArrayBooleanProps = OptionArrayBaseProps<boolean>;

export type OptionArrayBooleanPropsWithDefault = AddDefaultToOption<
  OptionArrayBooleanProps,
  boolean[]
>;

export type OptionArrayNumberProps = OptionArrayBaseProps<number>;

export type OptionArrayNumberPropsWithDefault = AddDefaultToOption<
  OptionArrayNumberProps,
  number[]
>;

export type OptionArrayStringProps = OptionArrayBaseProps<string>;

export type OptionArrayStringPropsWithDefault = AddDefaultToOption<
  OptionArrayStringProps,
  string[]
>;

export type OptionArrayObjectProps = OptionArrayBaseProps<UnknownObject>;

export type OptionArrayObjectPropsWithDefault = AddDefaultToOption<
  OptionArrayObjectProps,
  UnknownObject[]
>;

export type OptionGenericProps =
  | OptionBooleanProps
  | OptionBooleanPropsWithDefault
  | OptionNumberProps
  | OptionNumberPropsWithDefault
  | OptionStringProps
  | OptionStringPropsWithDefault
  | OptionObjectProps
  | OptionObjectPropsWithDefault
  | OptionNullProps
  | OptionNullPropsWithDefault;

export type OptionArrayGenericProps =
  | OptionArrayBooleanProps
  | OptionArrayBooleanPropsWithDefault
  | OptionArrayNumberProps
  | OptionArrayNumberPropsWithDefault
  | OptionArrayStringProps
  | OptionArrayStringPropsWithDefault
  | OptionArrayObjectProps
  | OptionArrayObjectPropsWithDefault;

export type OptionDefinition = OptionBase & (OptionGenericProps | OptionArrayGenericProps);

export type OptionBoolean = OptionBase & OptionBooleanProps;
export type OptionBooleanWithDefault = OptionBase & OptionBooleanPropsWithDefault;
export type OptionNumber = OptionBase & OptionNumberProps;
export type OptionNumberWithDefault = OptionBase & OptionNumberPropsWithDefault;
export type OptionString = OptionBase & OptionStringProps;
export type OptionStringWithDefault = OptionBase & OptionStringPropsWithDefault;
export type OptionObject = OptionBase & OptionObjectProps;
export type OptionObjectWithDefault = OptionBase & OptionObjectPropsWithDefault;
export type OptionNull = OptionBase & OptionNullProps;
export type OptionNullWithDefault = OptionBase & OptionNullPropsWithDefault;
export type OptionArrayBoolean = OptionBase & OptionArrayBooleanProps;
export type OptionArrayBooleanWithDefault = OptionBase & OptionArrayBooleanPropsWithDefault;
export type OptionArrayNumber = OptionBase & OptionArrayNumberProps;
export type OptionArrayNumberWithDefault = OptionBase & OptionArrayNumberPropsWithDefault;
export type OptionArrayString = OptionBase & OptionArrayStringProps;
export type OptionArrayStringWithDefault = OptionBase & OptionArrayStringPropsWithDefault;
export type OptionArrayObject = OptionBase & OptionArrayObjectProps;
export type OptionArrayObjectWithDefault = OptionBase & OptionArrayObjectPropsWithDefault;

export type OptionArrayGeneric =
  | OptionArrayBoolean
  | OptionArrayNumber
  | OptionArrayString
  | OptionArrayObject
  | OptionArrayBooleanWithDefault
  | OptionArrayNumberWithDefault
  | OptionArrayStringWithDefault
  | OptionArrayObjectWithDefault;

export type GetOptionTypeFromDefinition<T extends OptionDefinition> =
  T extends OptionBooleanWithDefault
    ? OptionBooleanWithDefault
    : T extends OptionBoolean
    ? OptionBoolean
    : T extends OptionNumberWithDefault
    ? OptionNumberWithDefault
    : T extends OptionNumber
    ? OptionNumber
    : T extends OptionStringWithDefault
    ? OptionStringWithDefault
    : T extends OptionString
    ? OptionString
    : T extends OptionObjectWithDefault
    ? OptionObjectWithDefault
    : T extends OptionObjectProps
    ? OptionObjectProps
    : T extends OptionNullWithDefault
    ? OptionNullWithDefault
    : T extends OptionNullProps
    ? OptionNullProps
    : T extends OptionArrayBooleanWithDefault
    ? OptionArrayBooleanWithDefault
    : T extends OptionArrayBoolean
    ? OptionArrayBoolean
    : T extends OptionArrayNumberWithDefault
    ? OptionArrayNumberWithDefault
    : T extends OptionArrayNumber
    ? OptionArrayNumber
    : T extends OptionArrayStringWithDefault
    ? OptionArrayStringWithDefault
    : T extends OptionArrayString
    ? OptionArrayString
    : T extends OptionArrayObjectWithDefault
    ? OptionArrayObjectWithDefault
    : T extends OptionArrayObject
    ? OptionArrayObject
    : never;

export type GetOptionValueTypeFromDefinition<T extends OptionDefinition> =
  T extends OptionBooleanWithDefault
    ? boolean
    : T extends OptionBoolean
    ? boolean | undefined
    : T extends OptionNumberWithDefault
    ? number
    : T extends OptionNumber
    ? number | undefined
    : T extends OptionStringWithDefault
    ? string
    : T extends OptionString
    ? string | undefined
    : T extends OptionObjectWithDefault
    ? UnknownObject
    : T extends OptionObject
    ? UnknownObject | undefined
    : T extends OptionNullWithDefault
    ? null
    : T extends OptionNull
    ? null | undefined
    : T extends OptionArrayBooleanWithDefault
    ? boolean[]
    : T extends OptionArrayBoolean
    ? boolean[] | undefined
    : T extends OptionArrayNumberWithDefault
    ? number[]
    : T extends OptionArrayNumber
    ? number[] | undefined
    : T extends OptionArrayStringWithDefault
    ? string[]
    : T extends OptionArrayString
    ? string[] | undefined
    : T extends OptionArrayObjectWithDefault
    ? UnknownObject[]
    : T extends OptionArrayObject
    ? UnknownObject[] | undefined
    : never;

export type WithDefault<T extends OptionDefinition> = T extends OptionBoolean
  ? OptionBooleanWithDefault
  : T extends OptionNumber
  ? OptionNumberWithDefault
  : T extends OptionString
  ? OptionStringWithDefault
  : T extends OptionObject
  ? OptionObjectWithDefault
  : T extends OptionNull
  ? OptionNullWithDefault
  : T extends OptionArrayBoolean
  ? OptionArrayBooleanWithDefault
  : T extends OptionArrayNumber
  ? OptionArrayNumberWithDefault
  : T extends OptionArrayString
  ? OptionArrayStringWithDefault
  : T extends OptionArrayObject
  ? OptionArrayObjectWithDefault
  : never;

/** Creates an option interface */
export interface OptionConstructor {
  /**
   * Creates an option interface
   * @param option - Option properties {@link OptionDefinition}
   * @returns Option interface {@link OptionInterface}.
   * @example const option = new Option({ name: "foo", type: "string" })
   */
  new (option: OptionDefinition): OptionInterface<OptionDefinition>;
}

/** Option interface */
export interface OptionInterface<T extends OptionDefinition> {
  get name(): T["name"];

  get description(): T["description"];

  get extraData(): T["extraData"];

  /** Option value has been already set or not (if not, it returns the default value) */
  get hasBeenSet(): boolean;

  /** Option value can be set to null or not */
  get nullable(): boolean;

  get type(): GetOptionTypeFromDefinition<T>["type"];

  /** Current value */
  get value(): GetOptionValueTypeFromDefinition<T>;

  set value(value: GetOptionValueTypeFromDefinition<T>);

  get itemsType(): GetOptionTypeFromDefinition<T>["itemsType"];

  get default(): GetOptionValueTypeFromDefinition<T> | undefined;
  /**
   * Allows to execute a function whenever the option value changes
   * @param eventListener - Function to execute when the option value changes {@link EventListener}
   * @returns Function allowing to remove the event listener. Once executed, the eventListener won't be executed any more {@link EventListenerRemover}
   * @example const removeOnChangeListener = option.onChange(() => console.log("option value changed"))
   */
  onChange(eventListener: EventListener): EventListenerRemover;
  /**
   * Set the value of the option
   * @param value - New value for the option
   * @param options - Options {@link SetMethodOptions}
   * @example option.set({ foo: 2 }, { merge: false })
   */
  set(value: GetOptionValueTypeFromDefinition<T>, options: SetMethodOptions): void;

  /**
   * Start emitting events
   * @example option.startEvents()
   */
  startEvents(): void;
}

export type OptionInterfaceGeneric = OptionInterface<OptionDefinition>;

/** Options of the set method */
export interface SetMethodOptions {
  /** When passed value is an object, determines whether it has to be merged with previous value or not */
  merge?: boolean;
}
