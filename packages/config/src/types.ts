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

type OptionType = typeof STRING_TYPE | typeof NUMBER_TYPE | typeof BOOLEAN_TYPE | typeof OBJECT_TYPE | typeof ARRAY_TYPE | typeof NULL_TYPE;

interface OptionBoolean {
  type: typeof BOOLEAN_TYPE
  value: boolean
}

interface OptionNumber {
  type: typeof NUMBER_TYPE
  value: number
}

interface OptionString {
  type: typeof STRING_TYPE
  value: string
}

interface OptionObject {
  type: typeof OBJECT_TYPE
  value: Record<string, unknown>
}

interface OptionArray {
  type: typeof ARRAY_TYPE
  value: Record<string, unknown>
  itemsType: OptionType
}

interface OptionNull {
  type: typeof NULL_TYPE
  value: null
}

interface ValueParser {
  (value: unknown): unknown
}

type Option = OptionBoolean | OptionNumber | OptionString | OptionObject | OptionArray | OptionNull

const FALSY_VALUES = ["false", "0", 0];

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

function optionIsArray(option: Option): option is OptionArray {
  return typeIsArray(option.type);
}

function doNothingParser(value: unknown): unknown {
  return value;
}

export function parseObject(value: string): string | Record<string, unknown> {
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

function getTypeParserWithBooleans(type: OptionType) {
  if (typeIsBoolean(type)) {
    return parseBoolean as ValueParser;
  }
  return getTypeParser(type) as ValueParser;
}

export function getOptionParser(option: Option) {
  return getTypeParser(option.type) as ValueParser;
}

function ParseArrayContents(option: OptionArray) {
  const parseArrayContents = getTypeParserWithBooleans(option.itemsType);
  return function (array: unknown[]) {
    return array.map((item) => parseArrayContents(item));
  };
}

export function getOptionParserWithBooleansAndArrays(option: Option) {
  if (typeIsBoolean(option.type)) {
    return parseBoolean as ValueParser;
  }
  if (typeIsArray(option.type)) {
    return parseObject as ValueParser;
  }
  return getOptionParser(option);
}

export function getOptionParserWithArrayContents(option: Option) {
  if (optionIsArray(option)) {
    return ParseArrayContents(option);
  }
  return getOptionParser(option);
}

export function avoidArraysMerge(_destinationArray: unknown[], sourceArray: unknown[]) {
  return sourceArray;
}
