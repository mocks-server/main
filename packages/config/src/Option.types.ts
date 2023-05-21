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

type OptionNumberPropsWithDefault = AddDefaultToOption<OptionNumberProps, number>;

type OptionStringProps = OptionBaseProps<string>;

type OptionStringPropsWithDefault = AddDefaultToOption<OptionStringProps, string>;

type OptionObjectProps = OptionBaseProps<UnknownObject>;

type OptionObjectPropsWithDefault = AddDefaultToOption<OptionObjectProps, UnknownObject>;

type OptionNullProps = OptionBaseProps<null>;

type OptionNullPropsWithDefault = AddDefaultToOption<OptionNullProps, null>;

type OptionUnknownProps = OptionBaseProps<unknown>;

type OptionUnknownPropsWithDefault = AddDefaultToOption<OptionNullProps, unknown>;

interface OptionArrayBaseProps<T extends OptionArrayValueContent> {
  type: "array";
  itemsType?: TypeToStringType<T>;
}

type OptionArrayBooleanProps = OptionArrayBaseProps<boolean>;

type OptionArrayBooleanPropsWithDefault = AddDefaultToOption<OptionArrayBooleanProps, boolean[]>;

type OptionArrayNumberProps = OptionArrayBaseProps<number>;

type OptionArrayNumberPropsWithDefault = AddDefaultToOption<OptionArrayNumberProps, number[]>;

type OptionArrayStringProps = OptionArrayBaseProps<string>;

type OptionArrayStringPropsWithDefault = AddDefaultToOption<OptionArrayStringProps, string[]>;

type OptionArrayObjectProps = OptionArrayBaseProps<UnknownObject>;

type OptionArrayObjectPropsWithDefault = AddDefaultToOption<
  OptionArrayObjectProps,
  UnknownObject[]
>;

type OptionArrayUnknownProps = OptionArrayBaseProps<unknown>;

type OptionArrayUnknownPropsWithDefault = AddDefaultToOption<OptionArrayUnknownProps, unknown[]>;

type OptionGenericProps =
  | OptionBooleanProps
  | OptionBooleanPropsWithDefault
  | OptionNumberProps
  | OptionNumberPropsWithDefault
  | OptionStringProps
  | OptionStringPropsWithDefault
  | OptionObjectProps
  | OptionObjectPropsWithDefault
  | OptionNullProps
  | OptionNullPropsWithDefault
  | OptionUnknownProps
  | OptionUnknownPropsWithDefault;

type OptionArrayGenericProps =
  | OptionArrayBooleanProps
  | OptionArrayBooleanPropsWithDefault
  | OptionArrayNumberProps
  | OptionArrayNumberPropsWithDefault
  | OptionArrayStringProps
  | OptionArrayStringPropsWithDefault
  | OptionArrayObjectProps
  | OptionArrayObjectPropsWithDefault
  | OptionArrayUnknownProps
  | OptionArrayUnknownPropsWithDefault;

export type OptionDefinitionGeneric = OptionBase & (OptionGenericProps | OptionArrayGenericProps);

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
export type OptionUnknown = OptionBase & OptionUnknownProps;
export type OptionUnknownWithDefault = OptionBase & OptionUnknownPropsWithDefault;
export type OptionArrayBoolean = OptionBase & OptionArrayBooleanProps;
export type OptionArrayBooleanWithDefault = OptionBase & OptionArrayBooleanPropsWithDefault;
export type OptionArrayNumber = OptionBase & OptionArrayNumberProps;
export type OptionArrayNumberWithDefault = OptionBase & OptionArrayNumberPropsWithDefault;
export type OptionArrayString = OptionBase & OptionArrayStringProps;
export type OptionArrayStringWithDefault = OptionBase & OptionArrayStringPropsWithDefault;
export type OptionArrayObject = OptionBase & OptionArrayObjectProps;
export type OptionArrayObjectWithDefault = OptionBase & OptionArrayObjectPropsWithDefault;
type OptionArrayUnknown = OptionBase & OptionArrayUnknownProps;
type OptionArrayUnknownWithDefault = OptionBase & OptionArrayUnknownPropsWithDefault;

export type OptionArrayGeneric =
  | OptionArrayBoolean
  | OptionArrayNumber
  | OptionArrayString
  | OptionArrayObject
  | OptionArrayUnknown
  | OptionArrayBooleanWithDefault
  | OptionArrayNumberWithDefault
  | OptionArrayStringWithDefault
  | OptionArrayObjectWithDefault
  | OptionArrayUnknownWithDefault;

export type GetOptionTypeFromDefinition<T extends OptionDefinitionGeneric> =
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
    : T extends OptionObject
    ? OptionObject
    : T extends OptionNullWithDefault
    ? OptionNullWithDefault
    : T extends OptionNull
    ? OptionNull
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
    : T extends OptionArrayUnknownWithDefault
    ? OptionArrayUnknownWithDefault
    : T extends OptionArrayUnknown
    ? OptionArrayUnknown
    : T extends OptionUnknownWithDefault
    ? OptionUnknownWithDefault
    : T extends OptionUnknown
    ? OptionUnknown
    : never;

export type GetOptionHasDefaultFromDefinition<T extends OptionDefinitionGeneric> =
  T extends OptionBooleanWithDefault
    ? true
    : T extends OptionNumberWithDefault
    ? true
    : T extends OptionStringWithDefault
    ? true
    : T extends OptionObjectWithDefault
    ? true
    : T extends OptionNullWithDefault
    ? true
    : T extends OptionArrayBooleanWithDefault
    ? true
    : T extends OptionArrayNumberWithDefault
    ? true
    : T extends OptionArrayStringWithDefault
    ? true
    : T extends OptionArrayObjectWithDefault
    ? true
    : T extends OptionArrayUnknownWithDefault
    ? true
    : T extends OptionUnknownWithDefault
    ? true
    : void;

export type GetOptionValueTypeFromDefinition<
  T extends OptionDefinitionGeneric,
  TypeOfValue = void
> = TypeOfValue extends void
  ? T extends OptionBooleanWithDefault
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
    : T extends OptionArrayUnknownWithDefault
    ? unknown[]
    : T extends OptionArrayUnknown
    ? unknown[] | undefined
    : T extends OptionUnknownWithDefault
    ? unknown
    : T extends OptionUnknown
    ? unknown | undefined
    : never
  : TypeOfValue;

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

export type OptionDefinition<T, TypeOfDefault = void> = TypeOfDefault extends true
  ? WithDefault<T>
  : T extends boolean
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
  onChange(eventListener: EventListener): EventListenerRemover;
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

export type OptionInterfaceOfType<TypeOfValue, HasDefault = void> = OptionInterface<
  OptionDefinition<TypeOfValue, HasDefault>,
  GetOptionHasDefaultFromDefinition<OptionDefinition<TypeOfValue, HasDefault>> extends true
    ? TypeOfValue
    : TypeOfValue | undefined
>;
