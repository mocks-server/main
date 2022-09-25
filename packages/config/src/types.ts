import type { 
  OptionInterface,
  OptionType,
  OptionInterfaceArray,
  OptionInterfaceBoolean,
  ItemsType 
} from "./types/Option";
import type { AnyObject } from "./types/Common";

const FALSY_VALUES = ["false", "0", 0];

export const STRING_TYPE = "string";
export const NUMBER_TYPE = "number";
export const BOOLEAN_TYPE = "boolean";
export const OBJECT_TYPE = "object";
export const ARRAY_TYPE = "array";
export const NULL_TYPE = "null";

interface ValueParser {
  (value: unknown): unknown
}

interface StringObjectParser {
  (value: string): AnyObject | string
}

interface BooleanParser {
  (value: string): boolean
}

interface ArrayValueParser {
  (value: unknown[]): unknown[]
}

function typeIsNumber(type: OptionType): boolean {
  return type === NUMBER_TYPE;
}

function typeIsBoolean(type: OptionType): boolean {
  return type === BOOLEAN_TYPE;
}

export function typeIsObject(type: OptionType): boolean {
  return type === OBJECT_TYPE;
}

export function typeIsArray(type: OptionType): boolean {
  return type === ARRAY_TYPE;
}

export function optionIsArray(option: OptionInterface): option is OptionInterfaceArray {
  return typeIsArray(option.type);
}

function doNothingParser(value: unknown): unknown {
  return value;
}

export function parseObject(value: string): AnyObject | string {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function parseBoolean(value: string): boolean {
  return !FALSY_VALUES.includes(value);
}

function getTypeParser(type: OptionType) {
  if (typeIsNumber(type)) {
    return parseFloat;
  }
  if (typeIsObject(type)) {
    return parseObject;
  }
  return doNothingParser;
}

function getTypeParserWithBooleans(type: ItemsType): ValueParser {
  if (typeIsBoolean(type)) {
    return parseBoolean as ValueParser;
  }
  return getTypeParser(type) as ValueParser;
}

export function getOptionParser(option: OptionInterface) {
  return getTypeParser(option.type) as ValueParser;
}

function ParseArrayContents(option: OptionInterfaceArray): ArrayValueParser {
  const parseArrayContents = getTypeParserWithBooleans(option.itemsType);
  return function (array: unknown[]) {
    return array.map((item) => parseArrayContents(item));
  };
}


export function getOptionParserWithBooleansAndArrays<T extends OptionInterface>(option: T): T extends OptionInterfaceArray ? StringObjectParser : T extends OptionInterfaceBoolean ? BooleanParser : ValueParser;
export function getOptionParserWithBooleansAndArrays(option: OptionInterface): ValueParser | StringObjectParser | BooleanParser {
  if (optionIsArray(option)) {
    return parseObject as ValueParser;
  }
  if (typeIsBoolean(option.type)) {
    return parseBoolean as ValueParser;
  }
  return getOptionParser(option);
}

export function getOptionParserWithArrayContents<T extends OptionInterface>(option: T): T extends OptionInterfaceArray ? ArrayValueParser : ValueParser;
export function getOptionParserWithArrayContents(option: OptionInterface): ArrayValueParser | ValueParser {
  if (optionIsArray(option)) {
    return ParseArrayContents(option);
  }
  return getOptionParser(option);
}

export function avoidArraysMerge(_destinationArray: unknown[], sourceArray: unknown[]): unknown[] {
  return sourceArray;
}
