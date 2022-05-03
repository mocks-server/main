const deepMerge = require("deepmerge");
const { isUndefined } = require("lodash");
const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors").default;

const { types } = require("./types");

const ajv = new Ajv({ allErrors: true });

const commonProps = {
  name: { type: "string" },
  description: { type: "string" },
};

const schema = {
  type: "object",
  oneOf: [
    {
      properties: {
        ...commonProps,
        type: { enum: [types.NUMBER] },
        default: { type: "number" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...commonProps,
        type: { enum: [types.STRING] },
        default: { type: "string" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...commonProps,
        type: { enum: [types.BOOLEAN] },
        default: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      properties: {
        ...commonProps,
        type: { enum: [types.OBJECT] },
        default: { type: "object" },
      },
      additionalProperties: false,
    },
  ],
  required: ["name", "type"],
};

const validateProperties = ajv.compile(schema);

class Option {
  constructor(properties) {
    // TODO, move to validations file
    const valid = validateProperties(properties);
    if (!valid) {
      throw new Error(betterAjvErrors(schema, properties, validateProperties.errors));
    }
    this._name = properties.name;
    this._type = properties.type;
    this._default = properties.default;
    this._value = this._default;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get default() {
    return this._default;
  }

  get value() {
    return this._value;
  }

  merge(value) {
    this._value = deepMerge(this._value || {}, value || {});
  }

  set value(value) {
    if (!isUndefined(value)) {
      this._value = value;
    }
  }
}

module.exports = Option;
