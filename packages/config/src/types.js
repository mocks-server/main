const types = {
  NUMBER: "Number",
  STRING: "String",
  BOOLEAN: "Boolean",
};

const FALSY_VALUES = ["false", "0", 0];

function doNothingParser(value) {
  return value;
}

function getOptionParser(option) {
  if (option.parser) {
    return option.parser;
  }
  if (option.type === types.NUMBER) {
    return parseFloat;
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
};
