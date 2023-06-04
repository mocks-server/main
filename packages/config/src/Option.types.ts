import type { ObjectWithName, UnknownObject } from "./Common.types";
import type { EventListener, EventListenerRemover } from "./Events.types";

/** Option name */
export type OptionName = string;

/** Option description */
export type OptionDescription = string;

/** Possible value types */
export type OptionType = "string" | "number" | "boolean" | "object" | "array" | "null" | "unknown";
/** Possible value types inside an array */
export type OptionItemsType = "string" | "number" | "boolean" | "object" | "unknown";

/** Possible types for the value of an option not being of type array */
export type OptionSingleValue =
  | boolean
  | number
  | string
  | UnknownObject
  | null
  | undefined
  | unknown;

/** Possible types for the value of an option of type array */
export type OptionArrayValueContent = boolean | number | string | UnknownObject | unknown;

export type OptionArrayValue = boolean[] | number[] | string[] | UnknownObject[] | unknown[];

export type OptionValue = OptionSingleValue | OptionArrayValue;

/** Extra data to store in the option interface */
export type OptionExtraData = UnknownObject;

/** Properties for creating an option */
interface OptionBase extends ObjectWithName {
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

type AddDefaultToOption<T, TValue> = T & {
  default: TValue;
};

type TypeToStringType<T> = T extends boolean
  ? "boolean"
  : T extends number
  ? "number"
  : T extends string
  ? "string"
  : T extends UnknownObject
  ? "object"
  : "unknown";

interface OptionBaseProps<T extends OptionSingleValue> {
  type: TypeToStringType<T>;
  itemsType?: undefined;
}

type SetNullable<T> = T & { nullable: true };

type OptionBooleanProps = OptionBaseProps<boolean>;

type OptionBooleanPropsNullable = SetNullable<OptionBooleanProps>;

type OptionBooleanPropsWithDefault = AddDefaultToOption<OptionBooleanProps, boolean>;

type OptionBooleanPropsWithDefaultNullable = SetNullable<OptionBooleanPropsWithDefault>;

type OptionNumberProps = OptionBaseProps<number>;

type OptionNumberPropsNullable = SetNullable<OptionNumberProps>;

type OptionNumberPropsWithDefault = AddDefaultToOption<OptionNumberProps, number>;

type OptionNumberPropsWithDefaultNullable = SetNullable<OptionNumberPropsWithDefault>;

type OptionStringProps = OptionBaseProps<string>;

type OptionStringPropsNullable = SetNullable<OptionStringProps>;

type OptionStringPropsWithDefault = AddDefaultToOption<OptionStringProps, string>;

type OptionStringPropsWithDefaultNullable = SetNullable<OptionStringPropsWithDefault>;

type OptionObjectProps = OptionBaseProps<UnknownObject>;

type OptionObjectPropsNullable = SetNullable<OptionObjectProps>;

type OptionObjectPropsWithDefault = AddDefaultToOption<OptionObjectProps, UnknownObject>;

type OptionObjectPropsWithDefaultNullable = SetNullable<OptionObjectPropsWithDefault>;

type OptionNullProps = OptionBaseProps<null>;

type OptionNullPropsWithDefault = AddDefaultToOption<OptionNullProps, null>;

type OptionUnknownProps = OptionBaseProps<unknown>;

type OptionUnknownPropsNullable = SetNullable<OptionUnknownProps>;

type OptionUnknownPropsWithDefault = AddDefaultToOption<OptionNullProps, unknown>;

type OptionUnknownPropsWithDefaultNullable = SetNullable<OptionUnknownPropsWithDefault>;

interface OptionArrayBaseProps<T extends OptionArrayValueContent> {
  type: "array";
  itemsType?: TypeToStringType<T>;
}

type OptionArrayBooleanProps = OptionArrayBaseProps<boolean>;

type OptionArrayBooleanPropsNullable = SetNullable<OptionArrayBooleanProps>;

type OptionArrayBooleanPropsWithDefault = AddDefaultToOption<OptionArrayBooleanProps, boolean[]>;

type OptionArrayBooleanPropsWithDefaultNullable = SetNullable<OptionArrayBooleanPropsWithDefault>;

type OptionArrayNumberProps = OptionArrayBaseProps<number>;

type OptionArrayNumberPropsNullable = SetNullable<OptionArrayNumberProps>;

type OptionArrayNumberPropsWithDefault = AddDefaultToOption<OptionArrayNumberProps, number[]>;

type OptionArrayNumberPropsWithDefaultNullable = SetNullable<OptionArrayNumberPropsWithDefault>;

type OptionArrayStringProps = OptionArrayBaseProps<string>;

type OptionArrayStringPropsNullable = SetNullable<OptionArrayStringProps>;

type OptionArrayStringPropsWithDefault = AddDefaultToOption<OptionArrayStringProps, string[]>;

type OptionArrayStringPropsWithDefaultNullable = SetNullable<OptionArrayStringPropsWithDefault>;

type OptionArrayObjectProps = OptionArrayBaseProps<UnknownObject>;

type OptionArrayObjectPropsNullable = SetNullable<OptionArrayObjectProps>;

type OptionArrayObjectPropsWithDefault = AddDefaultToOption<
  OptionArrayObjectProps,
  UnknownObject[]
>;

type OptionArrayObjectPropsWithDefaultNullable = SetNullable<OptionArrayObjectPropsWithDefault>;

type OptionArrayUnknownProps = OptionArrayBaseProps<unknown>;

type OptionArrayUnknownPropsNullable = SetNullable<OptionArrayUnknownProps>;

type OptionArrayUnknownPropsWithDefault = AddDefaultToOption<OptionArrayUnknownProps, unknown[]>;

type OptionArrayUnknownPropsWithDefaultNullable = SetNullable<OptionArrayUnknownPropsWithDefault>;

type OptionGenericProps =
  | OptionBooleanProps
  | OptionBooleanPropsNullable
  | OptionBooleanPropsWithDefault
  | OptionBooleanPropsWithDefaultNullable
  | OptionNumberProps
  | OptionNumberPropsNullable
  | OptionNumberPropsWithDefault
  | OptionNumberPropsWithDefaultNullable
  | OptionStringProps
  | OptionStringPropsNullable
  | OptionStringPropsWithDefault
  | OptionStringPropsWithDefaultNullable
  | OptionObjectProps
  | OptionObjectPropsNullable
  | OptionObjectPropsWithDefault
  | OptionObjectPropsWithDefaultNullable
  | OptionNullProps
  | OptionNullPropsWithDefault
  | OptionUnknownProps
  | OptionUnknownPropsNullable
  | OptionUnknownPropsWithDefault
  | OptionUnknownPropsWithDefaultNullable;

type OptionArrayGenericProps =
  | OptionArrayBooleanProps
  | OptionArrayBooleanPropsNullable
  | OptionArrayBooleanPropsWithDefault
  | OptionArrayBooleanPropsWithDefaultNullable
  | OptionArrayNumberProps
  | OptionArrayNumberPropsNullable
  | OptionArrayNumberPropsWithDefault
  | OptionArrayNumberPropsWithDefaultNullable
  | OptionArrayStringProps
  | OptionArrayStringPropsNullable
  | OptionArrayStringPropsWithDefault
  | OptionArrayStringPropsWithDefaultNullable
  | OptionArrayObjectProps
  | OptionArrayObjectPropsNullable
  | OptionArrayObjectPropsWithDefault
  | OptionArrayObjectPropsWithDefaultNullable
  | OptionArrayUnknownProps
  | OptionArrayUnknownPropsNullable
  | OptionArrayUnknownPropsWithDefault
  | OptionArrayUnknownPropsWithDefaultNullable;

export type OptionDefinitionGeneric = OptionBase & (OptionGenericProps | OptionArrayGenericProps);

export type OptionBoolean = OptionBase & OptionBooleanProps;
type OptionBooleanNullable = OptionBase & OptionBooleanPropsNullable;
type OptionBooleanWithDefault = OptionBase & OptionBooleanPropsWithDefault;
type OptionBooleanWithDefaultNullable = OptionBase & OptionBooleanPropsWithDefaultNullable;
type OptionNumber = OptionBase & OptionNumberProps;
type OptionNumberNullable = OptionBase & OptionNumberPropsNullable;
type OptionNumberWithDefault = OptionBase & OptionNumberPropsWithDefault;
type OptionNumberWithDefaultNullable = OptionBase & OptionNumberPropsWithDefaultNullable;
type OptionString = OptionBase & OptionStringProps;
type OptionStringNullable = OptionBase & OptionStringPropsNullable;
type OptionStringWithDefault = OptionBase & OptionStringPropsWithDefault;
type OptionStringWithDefaultNullable = OptionBase & OptionStringPropsWithDefaultNullable;
export type OptionObject = OptionBase & OptionObjectProps;
type OptionObjectNullable = OptionBase & OptionObjectPropsNullable;
type OptionObjectWithDefault = OptionBase & OptionObjectPropsWithDefault;
type OptionObjectWithDefaultNullable = OptionBase & OptionObjectPropsWithDefaultNullable;
type OptionNull = OptionBase & OptionNullProps;
type OptionNullWithDefault = OptionBase & OptionNullPropsWithDefault;
type OptionUnknown = OptionBase & OptionUnknownProps;
type OptionUnknownNullable = OptionBase & OptionUnknownPropsNullable;
type OptionUnknownWithDefault = OptionBase & OptionUnknownPropsWithDefault;
type OptionUnknownWithDefaultNullable = OptionBase & OptionUnknownPropsWithDefaultNullable;
type OptionArrayBoolean = OptionBase & OptionArrayBooleanProps;
type OptionArrayBooleanNullable = OptionBase & OptionArrayBooleanPropsNullable;
type OptionArrayBooleanWithDefault = OptionBase & OptionArrayBooleanPropsWithDefault;
type OptionArrayBooleanWithDefaultNullable = OptionBase &
  OptionArrayBooleanPropsWithDefaultNullable;
type OptionArrayNumber = OptionBase & OptionArrayNumberProps;
type OptionArrayNumberNullable = OptionBase & OptionArrayNumberPropsNullable;
type OptionArrayNumberWithDefault = OptionBase & OptionArrayNumberPropsWithDefault;
type OptionArrayNumberWithDefaultNullable = OptionBase & OptionArrayNumberPropsWithDefaultNullable;
type OptionArrayString = OptionBase & OptionArrayStringProps;
type OptionArrayStringNullable = OptionBase & OptionArrayStringPropsNullable;
type OptionArrayStringWithDefault = OptionBase & OptionArrayStringPropsWithDefault;
type OptionArrayStringWithDefaultNullable = OptionBase & OptionArrayStringPropsWithDefaultNullable;
type OptionArrayObject = OptionBase & OptionArrayObjectProps;
type OptionArrayObjectNullable = OptionBase & OptionArrayObjectPropsNullable;
type OptionArrayObjectWithDefault = OptionBase & OptionArrayObjectPropsWithDefault;
type OptionArrayObjectWithDefaultNullable = OptionBase & OptionArrayObjectPropsWithDefaultNullable;
type OptionArrayUnknown = OptionBase & OptionArrayUnknownProps;
type OptionArrayUnknownNullable = OptionBase & OptionArrayUnknownPropsNullable;
type OptionArrayUnknownWithDefault = OptionBase & OptionArrayUnknownPropsWithDefault;
type OptionArrayUnknownWithDefaultNullable = OptionBase &
  OptionArrayUnknownPropsWithDefaultNullable;

export type OptionArrayGeneric =
  | OptionArrayBoolean
  | OptionArrayBooleanNullable
  | OptionArrayNumber
  | OptionArrayNumberNullable
  | OptionArrayString
  | OptionArrayStringNullable
  | OptionArrayObject
  | OptionArrayObjectNullable
  | OptionArrayUnknown
  | OptionArrayUnknownNullable
  | OptionArrayBooleanWithDefault
  | OptionArrayBooleanWithDefaultNullable
  | OptionArrayNumberWithDefault
  | OptionArrayNumberWithDefaultNullable
  | OptionArrayStringWithDefault
  | OptionArrayStringWithDefaultNullable
  | OptionArrayObjectWithDefault
  | OptionArrayObjectWithDefaultNullable
  | OptionArrayUnknownWithDefault
  | OptionArrayUnknownWithDefaultNullable;

export type GetOptionTypeFromDefinition<T extends OptionDefinitionGeneric> =
  T extends OptionBooleanWithDefaultNullable
    ? OptionBooleanWithDefaultNullable
    : T extends OptionBooleanWithDefault
    ? OptionBooleanWithDefault
    : T extends OptionBooleanNullable
    ? OptionBooleanNullable
    : T extends OptionBoolean
    ? OptionBoolean
    : T extends OptionNumberWithDefaultNullable
    ? OptionNumberWithDefaultNullable
    : T extends OptionNumberWithDefault
    ? OptionNumberWithDefault
    : T extends OptionNumberNullable
    ? OptionNumberNullable
    : T extends OptionNumber
    ? OptionNumber
    : T extends OptionStringWithDefaultNullable
    ? OptionStringWithDefaultNullable
    : T extends OptionStringWithDefault
    ? OptionStringWithDefault
    : T extends OptionStringNullable
    ? OptionStringNullable
    : T extends OptionString
    ? OptionString
    : T extends OptionObjectWithDefaultNullable
    ? OptionObjectWithDefaultNullable
    : T extends OptionObjectWithDefault
    ? OptionObjectWithDefault
    : T extends OptionObjectNullable
    ? OptionObjectNullable
    : T extends OptionObject
    ? OptionObject
    : T extends OptionNullWithDefault
    ? OptionNullWithDefault
    : T extends OptionNull
    ? OptionNull
    : T extends OptionArrayBooleanWithDefaultNullable
    ? OptionArrayBooleanWithDefaultNullable
    : T extends OptionArrayBooleanWithDefault
    ? OptionArrayBooleanWithDefault
    : T extends OptionArrayBooleanNullable
    ? OptionArrayBooleanNullable
    : T extends OptionArrayBoolean
    ? OptionArrayBoolean
    : T extends OptionArrayNumberWithDefaultNullable
    ? OptionArrayNumberWithDefaultNullable
    : T extends OptionArrayNumberWithDefault
    ? OptionArrayNumberWithDefault
    : T extends OptionArrayNumberNullable
    ? OptionArrayNumberNullable
    : T extends OptionArrayNumber
    ? OptionArrayNumber
    : T extends OptionArrayStringWithDefaultNullable
    ? OptionArrayStringWithDefaultNullable
    : T extends OptionArrayStringWithDefault
    ? OptionArrayStringWithDefault
    : T extends OptionArrayStringNullable
    ? OptionArrayStringNullable
    : T extends OptionArrayString
    ? OptionArrayString
    : T extends OptionArrayObjectWithDefaultNullable
    ? OptionArrayObjectWithDefaultNullable
    : T extends OptionArrayObjectWithDefault
    ? OptionArrayObjectWithDefault
    : T extends OptionArrayObjectNullable
    ? OptionArrayObjectNullable
    : T extends OptionArrayObject
    ? OptionArrayObject
    : T extends OptionArrayUnknownWithDefaultNullable
    ? OptionArrayUnknownWithDefaultNullable
    : T extends OptionArrayUnknownWithDefault
    ? OptionArrayUnknownWithDefault
    : T extends OptionArrayUnknownNullable
    ? OptionArrayUnknownNullable
    : T extends OptionArrayUnknown
    ? OptionArrayUnknown
    : T extends OptionUnknownWithDefaultNullable
    ? OptionUnknownWithDefaultNullable
    : T extends OptionUnknownWithDefault
    ? OptionUnknownWithDefault
    : T extends OptionUnknownNullable
    ? OptionUnknownNullable
    : T extends OptionUnknown
    ? OptionUnknown
    : never;

export type GetOptionIsNullableFromDefinition<T extends OptionDefinitionGeneric> =
  T extends OptionBooleanWithDefaultNullable
    ? true
    : T extends OptionNumberWithDefaultNullable
    ? true
    : T extends OptionStringWithDefaultNullable
    ? true
    : T extends OptionObjectWithDefaultNullable
    ? true
    : T extends OptionArrayBooleanWithDefaultNullable
    ? true
    : T extends OptionArrayNumberWithDefaultNullable
    ? true
    : T extends OptionArrayStringWithDefaultNullable
    ? true
    : T extends OptionArrayObjectWithDefaultNullable
    ? true
    : T extends OptionArrayUnknownWithDefaultNullable
    ? true
    : T extends OptionUnknownWithDefaultNullable
    ? true
    : false;

export type GetOptionHasDefaultFromDefinition<T extends OptionDefinitionGeneric> =
  T extends OptionBooleanWithDefaultNullable
    ? true
    : T extends OptionBooleanWithDefault
    ? true
    : T extends OptionNumberWithDefaultNullable
    ? true
    : T extends OptionNumberWithDefault
    ? true
    : T extends OptionStringWithDefaultNullable
    ? true
    : T extends OptionStringWithDefault
    ? true
    : T extends OptionObjectWithDefaultNullable
    ? true
    : T extends OptionObjectWithDefault
    ? true
    : T extends OptionNullWithDefault
    ? true
    : T extends OptionArrayBooleanWithDefaultNullable
    ? true
    : T extends OptionArrayBooleanWithDefault
    ? true
    : T extends OptionArrayNumberWithDefaultNullable
    ? true
    : T extends OptionArrayNumberWithDefault
    ? true
    : T extends OptionArrayStringWithDefaultNullable
    ? true
    : T extends OptionArrayStringWithDefault
    ? true
    : T extends OptionArrayObjectWithDefaultNullable
    ? true
    : T extends OptionArrayObjectWithDefault
    ? true
    : T extends OptionArrayUnknownWithDefaultNullable
    ? true
    : T extends OptionArrayUnknownWithDefault
    ? true
    : T extends OptionUnknownWithDefaultNullable
    ? true
    : T extends OptionUnknownWithDefault
    ? true
    : false;

type AllowNullOrNotFromDefinition<
  T extends OptionDefinitionGeneric,
  TypeOfValue
> = GetOptionIsNullableFromDefinition<T> extends true ? TypeOfValue | null : TypeOfValue;

type AllowUndefinedOrNotFromDefinition<
  T extends OptionDefinitionGeneric,
  TypeOfValue
> = GetOptionHasDefaultFromDefinition<T> extends true
  ? AllowNullOrNotFromDefinition<T, TypeOfValue>
  : AllowNullOrNotFromDefinition<T, TypeOfValue | undefined>;

export type GetOptionValueTypeFromDefinition<
  T extends OptionDefinitionGeneric,
  TypeOfValue = void
> = TypeOfValue extends void
  ? T extends OptionBooleanWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, boolean>
    : T extends OptionBooleanWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, boolean>
    : T extends OptionBooleanNullable
    ? AllowUndefinedOrNotFromDefinition<T, boolean>
    : T extends OptionBoolean
    ? AllowUndefinedOrNotFromDefinition<T, boolean>
    : T extends OptionNumberWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, number>
    : T extends OptionNumberWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, number>
    : T extends OptionNumberNullable
    ? AllowUndefinedOrNotFromDefinition<T, number>
    : T extends OptionNumber
    ? AllowUndefinedOrNotFromDefinition<T, number>
    : T extends OptionStringWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, string>
    : T extends OptionStringWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, string>
    : T extends OptionStringNullable
    ? AllowUndefinedOrNotFromDefinition<T, string>
    : T extends OptionString
    ? AllowUndefinedOrNotFromDefinition<T, string>
    : T extends OptionObjectWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject>
    : T extends OptionObjectWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject>
    : T extends OptionObjectNullable
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject>
    : T extends OptionObject
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject>
    : T extends OptionNullWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, null>
    : T extends OptionNull
    ? AllowUndefinedOrNotFromDefinition<T, null>
    : T extends OptionArrayBooleanWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, boolean[]>
    : T extends OptionArrayBooleanWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, boolean[]>
    : T extends OptionArrayBooleanNullable
    ? AllowUndefinedOrNotFromDefinition<T, boolean[]>
    : T extends OptionArrayBoolean
    ? AllowUndefinedOrNotFromDefinition<T, boolean[]>
    : T extends OptionArrayNumberWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, number[]>
    : T extends OptionArrayNumberWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, number[]>
    : T extends OptionArrayNumberNullable
    ? AllowUndefinedOrNotFromDefinition<T, number[]>
    : T extends OptionArrayNumber
    ? AllowUndefinedOrNotFromDefinition<T, number[]>
    : T extends OptionArrayStringWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, string[]>
    : T extends OptionArrayStringWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, string[]>
    : T extends OptionArrayStringNullable
    ? AllowUndefinedOrNotFromDefinition<T, string[]>
    : T extends OptionArrayString
    ? AllowUndefinedOrNotFromDefinition<T, string[]>
    : T extends OptionArrayObjectWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject[]>
    : T extends OptionArrayObjectWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject[]>
    : T extends OptionArrayObjectNullable
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject[]>
    : T extends OptionArrayObject
    ? AllowUndefinedOrNotFromDefinition<T, UnknownObject[]>
    : T extends OptionArrayUnknownWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, unknown[]>
    : T extends OptionArrayUnknownWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, unknown[]>
    : T extends OptionArrayUnknownNullable
    ? AllowUndefinedOrNotFromDefinition<T, unknown[]>
    : T extends OptionArrayUnknown
    ? AllowUndefinedOrNotFromDefinition<T, unknown[]>
    : T extends OptionUnknownWithDefaultNullable
    ? AllowUndefinedOrNotFromDefinition<T, unknown>
    : T extends OptionUnknownWithDefault
    ? AllowUndefinedOrNotFromDefinition<T, unknown>
    : T extends OptionUnknownNullable
    ? AllowUndefinedOrNotFromDefinition<T, unknown>
    : T extends OptionUnknown
    ? AllowUndefinedOrNotFromDefinition<T, unknown>
    : never
  : AllowUndefinedOrNotFromDefinition<T, TypeOfValue>;

export type WithDefault<T> = T extends boolean
  ? OptionBooleanWithDefault
  : T extends number
  ? OptionNumberWithDefault
  : T extends string
  ? OptionStringWithDefault
  : T extends UnknownObject
  ? OptionObjectWithDefault
  : T extends null
  ? OptionNullWithDefault
  : T extends Array<boolean>
  ? OptionArrayBooleanWithDefault
  : T extends Array<number>
  ? OptionArrayNumberWithDefault
  : T extends Array<string>
  ? OptionArrayStringWithDefault
  : T extends Array<UnknownObject>
  ? OptionArrayObjectWithDefault
  : T extends Array<unknown>
  ? OptionArrayUnknownWithDefault
  : T extends unknown
  ? OptionUnknownWithDefault
  : never;

export type WithNullable<T> = T extends boolean
  ? OptionBooleanNullable
  : T extends number
  ? OptionNumberNullable
  : T extends string
  ? OptionStringNullable
  : T extends UnknownObject
  ? OptionObjectNullable
  : T extends null
  ? OptionNull
  : T extends Array<boolean>
  ? OptionArrayBooleanNullable
  : T extends Array<number>
  ? OptionArrayNumberNullable
  : T extends Array<string>
  ? OptionArrayStringNullable
  : T extends Array<UnknownObject>
  ? OptionArrayObjectNullable
  : T extends Array<unknown>
  ? OptionArrayUnknownNullable
  : T extends unknown
  ? OptionUnknownNullable
  : never;

export type WithDefaultAndNullable<T> = T extends boolean
  ? OptionBooleanWithDefaultNullable
  : T extends number
  ? OptionNumberWithDefaultNullable
  : T extends string
  ? OptionStringWithDefaultNullable
  : T extends UnknownObject
  ? OptionObjectWithDefaultNullable
  : T extends null
  ? OptionNullWithDefault
  : T extends Array<boolean>
  ? OptionArrayBooleanWithDefaultNullable
  : T extends Array<number>
  ? OptionArrayNumberWithDefaultNullable
  : T extends Array<string>
  ? OptionArrayStringWithDefaultNullable
  : T extends Array<UnknownObject>
  ? OptionArrayObjectWithDefaultNullable
  : T extends Array<unknown>
  ? OptionArrayUnknownWithDefaultNullable
  : T extends unknown
  ? OptionUnknownWithDefaultNullable
  : never;

export type WithoutDefaultNotNullable<T> = T extends boolean
  ? OptionBoolean
  : T extends number
  ? OptionNumber
  : T extends string
  ? OptionString
  : T extends UnknownObject
  ? OptionObject
  : T extends null
  ? OptionNull
  : T extends Array<boolean>
  ? OptionArrayBoolean
  : T extends Array<number>
  ? OptionArrayNumber
  : T extends Array<string>
  ? OptionArrayString
  : T extends Array<UnknownObject>
  ? OptionArrayObject
  : T extends Array<unknown>
  ? OptionArrayUnknown
  : T extends unknown
  ? OptionUnknown
  : never;

interface OptionDefinitionOptions {
  hasDefault?: boolean;
  nullable?: boolean;
}

type GetHasDefaultFromOptions<T> = T extends { hasDefault: true } ? true : false;
type GetIsNullableFromOptions<T> = T extends { nullable: true } ? true : false;

export type OptionDefinition<
  T,
  Options extends OptionDefinitionOptions | void = void
> = GetIsNullableFromOptions<Options> extends true
  ? GetHasDefaultFromOptions<Options> extends true
    ? WithDefaultAndNullable<T>
    : WithNullable<T>
  : GetHasDefaultFromOptions<Options> extends true
  ? WithDefault<T>
  : WithoutDefaultNotNullable<T>;

/** Creates an option interface */
export interface OptionConstructor {
  /**
   * Creates an option interface
   * @param option - Option properties {@link OptionDefinitionGeneric}
   * @returns Option interface {@link OptionInterface}.
   * @example const option = new Option({ name: "foo", type: "string" })
   */
  new (option: OptionDefinitionGeneric): OptionInterface<OptionDefinitionGeneric>;
}

/** Option interface */
export interface OptionInterface<T extends OptionDefinitionGeneric, TypeOfValue = void> {
  get name(): T["name"];

  get description(): T["description"];

  get extraData(): T["extraData"];

  /** Option value has been already set or not (if not, it returns the default value) */
  get hasBeenSet(): boolean;

  /** Option value can be set to null or not */
  get nullable(): boolean;

  get type(): GetOptionTypeFromDefinition<T>["type"];

  /** Current value */
  get value(): GetOptionValueTypeFromDefinition<T, TypeOfValue>;

  set value(value: GetOptionValueTypeFromDefinition<T, TypeOfValue>);

  get itemsType(): GetOptionTypeFromDefinition<T>["itemsType"];

  get default(): GetOptionValueTypeFromDefinition<T, TypeOfValue>;
  /**
   * Allows to execute a function whenever the option value changes
   * @param eventListener - Function to execute when the option value changes {@link EventListener}
   * @returns Function allowing to remove the event listener. Once executed, the eventListener won't be executed any more {@link EventListenerRemover}
   * @example const removeOnChangeListener = option.onChange(() => console.log("option value changed"))
   */
  onChange(
    eventListener: EventListener<GetOptionValueTypeFromDefinition<T, TypeOfValue>>
  ): EventListenerRemover;
  /**
   * Set the value of the option
   * @param value - New value for the option
   * @param options - Options {@link SetMethodOptions}
   * @example option.set({ foo: 2 }, { merge: false })
   */
  set(value: GetOptionValueTypeFromDefinition<T, TypeOfValue>, options: SetMethodOptions): void;

  /**
   * Start emitting events
   * @example option.startEvents()
   */
  startEvents(): void;
}

export type OptionInterfaceGeneric = OptionInterface<OptionDefinitionGeneric>;

/** Options of the set method */
export interface SetMethodOptions {
  /** When passed value is an object, determines whether it has to be merged with previous value or not */
  merge?: boolean;
}

export type OptionInterfaceOfType<
  TypeOfValue,
  Options extends OptionDefinitionOptions | void = void
> = OptionInterface<OptionDefinition<TypeOfValue, Options>, TypeOfValue>;
