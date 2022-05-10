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

function validateStringAndThrow(value) {
  if (!isString(value)) {
    throwValueTypeError(value, types.STRING);
  }
}

function validateBooleanAndThrow(value) {
  if (!isBoolean(value)) {
    throwValueTypeError(value, types.BOOLEAN);
  }
}

function validateNumberAndThrow(value) {
  if (!isNumber(value)) {
    throwValueTypeError(value, types.NUMBER);
  }
}

function validateObjectAndThrow(value) {
  if (!isObject(value)) {
    throwValueTypeError(value, types.OBJECT);
  }
}

function validateArrayAndThrow(array, itemsType) {
  if (!Array.isArray(array)) {
    throwValueTypeError(array, types.ARRAY);
  }
  if (itemsType) {
    array.forEach((item) => {
      validateValueTypeAndThrow(item, itemsType);
    });
  }
}

const typeAndThrowValidators = {
  [types.STRING]: validateStringAndThrow,
  [types.BOOLEAN]: validateBooleanAndThrow,
  [types.NUMBER]: validateNumberAndThrow,
  [types.OBJECT]: validateObjectAndThrow,
  [types.ARRAY]: validateArrayAndThrow,
};

function validateSchema(config, schema, validator) {
  const validateProperties = validator || ajv.compile(schema);
  const valid = validateProperties(config);
  return {
    valid,
    errors: validateProperties.errors,
  };
}

function validateSchemaAndThrow(config, schema, validator) {
  const { valid, errors } = validateSchema(config, schema, validator);
  if (!valid) {
    throw new Error(betterAjvErrors(schema, config, errors));
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

function getConfigValidationSchema({ namespaces, allowAdditionalProperties }) {
  return addNamespacesSchema(namespaces, {
    rootSchema: emptySchema({ allowAdditionalProperties }),
    allowAdditionalProperties,
  });
}

function validateConfigAndThrow(config, { namespaces, allowAdditionalProperties }) {
  validateSchemaAndThrow(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties })
  );
}

function validateConfig(config, { namespaces, allowAdditionalProperties }) {
  return validateSchema(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties })
  );
}

function validateOption(properties) {
  validateSchema(properties, optionSchema, optionValidator);
}

function validateOptionAndThrow(properties) {
  validateSchemaAndThrow(properties, optionSchema, optionValidator);
}

function validateValueTypeAndThrow(value, type, itemsType) {
  typeAndThrowValidators[type](value, itemsType);
}

module.exports = {
  validateConfig,
  validateOption,
  validateConfigAndThrow,
  validateOptionAndThrow,
  validateValueTypeAndThrow,
};
