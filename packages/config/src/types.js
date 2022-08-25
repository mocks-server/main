const types = {
  NUMBER: "number",
  STRING: "string",
  BOOLEAN: "boolean",
  OBJECT: "object",
  ARRAY: "array",
  NULL: "null",
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

function getTypeParserWithBooleans(type) {
  if (type === types.BOOLEAN) {
    return parseBoolean;
  }
  return getTypeParser(type);
}

function getOptionParser(option) {
  return getTypeParser(option.type);
}

function ParseArrayContents(option) {
  const parseArrayContents = getTypeParserWithBooleans(option.itemsType);
  return function (array) {
    return array.map((item) => parseArrayContents(item));
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

function avoidArraysMerge(_destinationArray, sourceArray) {
  return sourceArray;
}

module.exports = {
  types,
  getOptionParser,
  getOptionParserWithBooleansAndArrays,
  getOptionParserWithArrayContents,
  parseObject,
  avoidArraysMerge,
};
