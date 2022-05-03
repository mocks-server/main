const types = {
  NUMBER: "Number",
  STRING: "String",
  BOOLEAN: "Boolean",
  OBJECT: "Object",
};

const FALSY_VALUES = ["false", "0", 0];

function doNothingParser(value) {
  return value;
}

function parseObject(value) {
  return JSON.parse(value);
}

function getOptionParser(option) {
  if (option.parser) {
    return option.parser;
  }
  if (option.type === types.NUMBER) {
    return parseFloat;
  }
  if (option.type === types.OBJECT) {
    return parseObject;
  }
  return doNothingParser;
}

function parseBoolean(value) {
  return !FALSY_VALUES.includes(value);
}

function getOptionParserIncludingBooleans(option) {
  if (option.type === types.BOOLEAN) {
    return parseBoolean;
  }
  return getOptionParser(option);
}

module.exports = {
  types,
  getOptionParser,
  getOptionParserIncludingBooleans,
  parseObject,
};
