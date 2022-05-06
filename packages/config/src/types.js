const { isUndefined } = require("lodash");

const types = {
  NUMBER: "number",
  STRING: "string",
  BOOLEAN: "boolean",
  OBJECT: "object",
  ARRAY: "array",
};

const FALSY_VALUES = ["false", "0", 0];

function doNothingParser(value) {
  return value;
}

function parseObject(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function parseBoolean(value) {
  return !FALSY_VALUES.includes(value);
}

function getTypeParser(type) {
  if (type === types.NUMBER) {
    return parseFloat;
  }
  if (type === types.OBJECT) {
    return parseObject;
  }
  return doNothingParser;
}

function getOptionParser(option) {
  return getTypeParser(option.type);
}

function ParseArrayContents(option) {
  const parseArrayContents = getTypeParser(option.itemsType);
  return function (array) {
    if (!isUndefined(array)) {
      return array.map((item) => parseArrayContents(item));
    }
  };
}

function getOptionParserWithBooleansAndArrays(option) {
  if (option.type === types.BOOLEAN) {
    return parseBoolean;
  }
  if (option.type === types.ARRAY) {
    return parseObject;
  }
  return getOptionParser(option);
}

function getOptionParserWithArrayContents(option) {
  if (option.type === types.ARRAY) {
    return ParseArrayContents(option);
  }
  return getOptionParser(option);
}

module.exports = {
  types,
  getOptionParser,
  getOptionParserWithBooleansAndArrays,
  getOptionParserWithArrayContents,
  parseObject,
};
