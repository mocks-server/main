const types = {
  NUMBER: "number",
  STRING: "string",
  BOOLEAN: "boolean",
  OBJECT: "object",
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

function getOptionParser(option) {
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
