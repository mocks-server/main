const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors").default;
const { isString, isNumber, isObject, isBoolean } = require("lodash");

const ajv = new Ajv({ allErrors: true });

const { types } = require("./types");

function enforceDefaultTypeSchema(type, itemsType) {
  const schema = {
    properties: {
      name: { type: types.STRING },
      type: { enum: [type] },
      description: { type: types.STRING },
      default: {
        type,
      },
      metaData: {
        type: types.OBJECT,
        additionalProperties: true,
      },
    },
    additionalProperties: false,
    required: ["name", "type"],
  };

  if (itemsType) {
    schema.properties.itemsType = { enum: [itemsType] };
    schema.properties.default.items = {
      type: itemsType,
    };
    schema.required = ["name", "type", "itemsType"];
  }

  return schema;
}

const optionSchema = {
  type: types.OBJECT,
  oneOf: [
    enforceDefaultTypeSchema(types.NUMBER),
    enforceDefaultTypeSchema(types.STRING),
    enforceDefaultTypeSchema(types.BOOLEAN),
    enforceDefaultTypeSchema(types.OBJECT),
    enforceDefaultTypeSchema(types.ARRAY),
    enforceDefaultTypeSchema(types.ARRAY, types.NUMBER),
    enforceDefaultTypeSchema(types.ARRAY, types.STRING),
    enforceDefaultTypeSchema(types.ARRAY, types.BOOLEAN),
    enforceDefaultTypeSchema(types.ARRAY, types.OBJECT),
  ],
};

const optionValidator = ajv.compile(optionSchema);

function emptySchema({ allowAdditionalProperties }) {
  return {
    type: types.OBJECT,
    properties: {},
    additionalProperties: allowAdditionalProperties,
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

function validateArray(array, itemsType) {
  if (!Array.isArray(array)) {
    throwValueTypeError(array, types.ARRAY);
  }
  if (itemsType) {
    array.forEach((item) => {
      validateValueType(item, itemsType);
    });
  }
}

const typeValidators = {
  [types.STRING]: validateString,
  [types.BOOLEAN]: validateBoolean,
  [types.NUMBER]: validateNumber,
  [types.OBJECT]: validateObject,
  [types.ARRAY]: validateArray,
};

function validateSchema(config, schema, validator) {
  const validateProperties = validator || ajv.compile(schema);
  const valid = validateProperties(config);
  // console.log(JSON.stringify(schema, null, 2));
  if (!valid) {
    throw new Error(betterAjvErrors(schema, config, validateProperties.errors));
  }
}

function addNamespaceSchema(namespace, { rootSchema, allowAdditionalProperties }) {
  const initialSchema = rootSchema || emptySchema({ allowAdditionalProperties });
  const schema = namespace.options.reduce((currentSchema, option) => {
    currentSchema.properties[option.name] = {
      type: option.type,
    };
    if (option.itemsType) {
      currentSchema.properties[option.name].items = {
        type: option.itemsType,
      };
    }
    return currentSchema;
  }, initialSchema);
  addNamespacesSchema(namespace.namespaces, {
    rootSchema: initialSchema,
    allowAdditionalProperties,
  });
  return schema;
}

function addNamespacesSchema(namespaces, { rootSchema, allowAdditionalProperties }) {
  const schema = namespaces.reduce((currentSchema, namespace) => {
    if (namespace.name) {
      currentSchema.properties[namespace.name] = addNamespaceSchema(namespace, {
        allowAdditionalProperties,
      });
    } else {
      addNamespaceSchema(namespace, { rootSchema: currentSchema, allowAdditionalProperties });
    }
    return currentSchema;
  }, rootSchema);
  return schema;
}

function validateConfig(config, { namespaces, allowUnknown }) {
  const schema = addNamespacesSchema(namespaces, {
    rootSchema: emptySchema({ allowAdditionalProperties: allowUnknown }),
    allowAdditionalProperties: allowUnknown,
  });
  validateSchema(config, schema);
}

function validateOption(properties) {
  validateSchema(properties, optionSchema, optionValidator);
}

function validateValueType(value, type, itemsType) {
  typeValidators[type](value, itemsType);
}

module.exports = {
  validateConfig,
  validateOption,
  validateValueType,
};
