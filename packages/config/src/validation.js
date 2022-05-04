const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors").default;
const { isString, isNumber, isObject, isBoolean } = require("lodash");

const ajv = new Ajv({ allErrors: true });

const { types } = require("./types");

const optionCommonProps = {
  name: { type: "string" },
  description: { type: "string" },
};

const optionSchema = {
  type: "object",
  oneOf: [
    {
      properties: {
        ...optionCommonProps,
        type: { enum: [types.NUMBER] },
        default: { type: "number" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...optionCommonProps,
        type: { enum: [types.STRING] },
        default: { type: "string" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...optionCommonProps,
        type: { enum: [types.BOOLEAN] },
        default: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...optionCommonProps,
        type: { enum: [types.OBJECT] },
        default: { type: "object" },
      },
      additionalProperties: false,
    },
  ],
  required: ["name", "type"],
};

const optionValidator = ajv.compile(optionSchema);

function emptySchema() {
  return {
    type: "object",
    properties: {},
    additionalProperties: false,
  };
}

function throwValueTypeError(value, type) {
  throw new Error(`${value} is not of type ${type}`);
}

function validateString(value) {
  if (!isString(value)) {
    throwValueTypeError(value, types.STRING);
  }
}

function validateBoolean(value) {
  if (!isBoolean(value)) {
    throwValueTypeError(value, types.BOOLEAN);
  }
}

function validateNumber(value) {
  if (!isNumber(value)) {
    throwValueTypeError(value, types.NUMBER);
  }
}

function validateObject(value) {
  if (!isObject(value)) {
    throwValueTypeError(value, types.OBJECT);
  }
}

const typeValidators = {
  [types.STRING]: validateString,
  [types.BOOLEAN]: validateBoolean,
  [types.NUMBER]: validateNumber,
  [types.OBJECT]: validateObject,
};

function namespaceSchema(namespace) {
  return Array.from(namespace.options).reduce((schema, option) => {
    schema.properties[option.name] = {
      type: option.type.toLowerCase(),
    };
    return schema;
  }, emptySchema());
}

function validate(config, schema, validator) {
  const validateProperties = validator || ajv.compile(schema);
  const valid = validateProperties(config);
  if (!valid) {
    throw new Error(betterAjvErrors(schema, config, validateProperties.errors));
  }
}

function validateConfig(config, { namespaces }) {
  const schema = Array.from(namespaces).reduce((fullSchema, namespace) => {
    fullSchema.properties[namespace.name] = namespaceSchema(namespace);
    return fullSchema;
  }, emptySchema());
  validate(config, schema);
}

function validateOption(properties) {
  validate(properties, optionSchema, optionValidator);
}

function validateValueType(value, type) {
  typeValidators[type](value);
}

module.exports = {
  validateConfig,
  validateOption,
  validateValueType,
};
