const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors").default;
const { isString, isNumber, isObject, isBoolean } = require("lodash");

const ajv = new Ajv({ allErrors: true });

const { types } = require("./types");

function enforceDefaultTypeSchema({ type, itemsType, nullable }) {
  const schema = {
    properties: {
      name: { type: types.STRING },
      type: { enum: [type] },
      nullable: { enum: [false] },
      description: { type: types.STRING },
      default: {
        type,
      },
      extraData: {
        type: types.OBJECT,
        additionalProperties: true,
      },
    },
    additionalProperties: false,
    required: ["name", "type", "nullable"],
  };

  if (nullable) {
    schema.properties.default.type = [type, types.NULL];
    schema.properties.nullable = { enum: [true] };
  }

  if (itemsType) {
    schema.properties.itemsType = { enum: [itemsType] };
    schema.properties.default.items = {
      type: itemsType,
    };
    schema.required = ["name", "type", "nullable", "itemsType"];
  }

  return schema;
}

const optionSchema = {
  type: types.OBJECT,
  oneOf: [
    enforceDefaultTypeSchema({ type: types.NUMBER }),
    enforceDefaultTypeSchema({ type: types.NUMBER, nullable: true }),
    enforceDefaultTypeSchema({ type: types.STRING }),
    enforceDefaultTypeSchema({ type: types.STRING, nullable: true }),
    enforceDefaultTypeSchema({ type: types.BOOLEAN }),
    enforceDefaultTypeSchema({ type: types.BOOLEAN, nullable: true }),
    enforceDefaultTypeSchema({ type: types.OBJECT }),
    enforceDefaultTypeSchema({ type: types.ARRAY }),
    enforceDefaultTypeSchema({ type: types.ARRAY, itemsType: types.NUMBER }),
    enforceDefaultTypeSchema({ type: types.ARRAY, itemsType: types.STRING }),
    enforceDefaultTypeSchema({ type: types.ARRAY, itemsType: types.BOOLEAN }),
    enforceDefaultTypeSchema({ type: types.ARRAY, itemsType: types.OBJECT }),
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

function formatErrors(schema, data, errors) {
  const formattedJson = betterAjvErrors(schema, data, errors, {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

function validateSchemaAndThrow(config, schema, validator) {
  const { valid, errors } = validateSchema(config, schema, validator);
  if (!valid) {
    throw new Error(formatErrors(schema, config, errors));
  }
}

function addNamespaceSchema(namespace, { rootSchema, allowAdditionalProperties }) {
  const initialSchema = rootSchema || emptySchema({ allowAdditionalProperties });
  const schema = namespace.options.reduce((currentSchema, option) => {
    if (option.nullable) {
      currentSchema.properties[option.name] = {
        type: [option.type, types.NULL],
      };
    } else {
      currentSchema.properties[option.name] = {
        type: option.type,
      };
    }

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
  return namespaces.reduce((currentSchema, namespace) => {
    if (namespace.name) {
      currentSchema.properties[namespace.name] = addNamespaceSchema(namespace, {
        allowAdditionalProperties,
      });
    } else {
      addNamespaceSchema(namespace, { rootSchema: currentSchema, allowAdditionalProperties });
    }
    return currentSchema;
  }, rootSchema);
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

function getValidationSchema({ namespaces, allowAdditionalProperties }) {
  return getConfigValidationSchema({ namespaces, allowAdditionalProperties });
}

function validateOptionAndThrow(properties) {
  validateSchemaAndThrow(properties, optionSchema, optionValidator);
}

function validateValueTypeAndThrow(value, type, nullable, itemsType) {
  if (nullable && value === null) {
    return;
  }
  typeAndThrowValidators[type](value, itemsType);
}

module.exports = {
  validateConfig,
  validateConfigAndThrow,
  validateOptionAndThrow,
  validateValueTypeAndThrow,
  getValidationSchema,
};
