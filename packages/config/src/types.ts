import { types } from "./types/Option";
import type { Option, OptionArray, OptionType, ItemsType } from "./types/Option";

interface ValueParser {
  (value: unknown): unknown
}

const FALSY_VALUES = ["false", "0", 0];

function typeIsNumber(type: OptionType): boolean {
  return type === types.NUMBER;
}

function typeIsBoolean(type: OptionType): boolean {
  return type === types.BOOLEAN;
}

export function typeIsObject(type: OptionType): boolean {
  return type === types.OBJECT;
}

export function typeIsArray(type: OptionType): boolean {
  return type === types.ARRAY;
}

export function optionIsArray(option: Option): option is OptionArray {
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

function getTypeParserWithBooleans(type: ItemsType) {
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
