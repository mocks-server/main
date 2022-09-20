import Ajv, { ValidateFunction, DefinedError } from "ajv"
import betterAjvErrors from "better-ajv-errors";
import { isString, isNumber, isObject, isBoolean } from "lodash";

import { types } from "./types/Option";
import { optionIsArray } from "./types";

import type { JSONSchema7TypeName, JSONSchema7, JSONSchema7Definition } from "json-schema"
import type { AnyObject } from "./types/Common";
import type { OptionProperties, OptionInterface, OptionType, ItemsType } from "./types/Option";
import type { NamespaceInterface } from "./types/Namespace";
import type { SchemaValidationResult } from "./types/Validation";

const ajv = new Ajv({ allErrors: true });

type AnySingleValue = unknown
type AnyArrayValue = unknown[]
type AnyValue = AnySingleValue | AnyArrayValue

function enforceDefaultTypeSchema({ type, itemsType, nullable } : { type: OptionType, itemsType?: ItemsType, nullable?: boolean }): JSONSchema7 {
  const properties : { [key: string]: JSONSchema7 } = {
    name: { type: types.STRING as JSONSchema7TypeName },
    type: { enum: [type] },
    nullable: { enum: [false] },
    description: { type: types.STRING as JSONSchema7TypeName },
    extraData: {
      type: types.OBJECT as JSONSchema7TypeName,
      additionalProperties: true,
    },
  };

  const schema: JSONSchema7 = {
    additionalProperties: false,
    required: ["name", "type", "nullable"],
  };

  const defaultProperty: JSONSchema7 = {}

  if (nullable) {
    defaultProperty.type = [type as JSONSchema7TypeName, types.NULL as JSONSchema7TypeName];
    properties.nullable = { enum: [true] };
  } else {
    defaultProperty.type = type as JSONSchema7TypeName;
  }

  if (itemsType) {
    properties.itemsType = { enum: [itemsType] };
    defaultProperty.items = {
      type: itemsType as JSONSchema7TypeName,
    };
    schema.required = ["name", "type", "nullable", "itemsType"];
  }

  properties.default = defaultProperty;
  schema.properties = properties;

  return schema;
}

const optionSchema : JSONSchema7 = {
  type: types.OBJECT as JSONSchema7TypeName,
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

const optionValidator : ValidateFunction = ajv.compile(optionSchema);

function emptySchema({ allowAdditionalProperties } : { allowAdditionalProperties: boolean }): JSONSchema7 {
  return {
    type: types.OBJECT as JSONSchema7TypeName,
    properties: {},
    additionalProperties: allowAdditionalProperties,
  };
}

function throwValueTypeError(value: AnyValue, type: OptionType): Error {
  throw new Error(`${value} is not of type ${type}`);
}

interface ThrowValidator {
  (value: unknown | unknown[], itemsType?: ItemsType): Error | void
}

interface TypeAndThrowValidators {
  [key: string]: ThrowValidator
}

function validateStringAndThrow(value: unknown): void | never {
  if (!isString(value)) {
    throwValueTypeError(value, types.STRING);
  }
}

function validateBooleanAndThrow(value: unknown): void | never {
  if (!isBoolean(value)) {
    throwValueTypeError(value, types.BOOLEAN);
  }
}

function validateNumberAndThrow(value: unknown): void | never {
  if (!isNumber(value)) {
    throwValueTypeError(value, types.NUMBER);
  }
}

function validateObjectAndThrow(value: unknown): void | never {
  if (!isObject(value)) {
    throwValueTypeError(value, types.OBJECT);
  }
}

function valueIsArray(value: AnyValue): value is AnyArrayValue {
  return Array.isArray(value);
}

function validateArrayAndThrow(value: AnyValue, itemsType?: ItemsType): void | never {
  if (valueIsArray(value)) {
    if(itemsType) {
      value.forEach((item) => {
        validateValueTypeAndThrow(item, itemsType);
      });
    }
  } else {
    throwValueTypeError(value, types.ARRAY);
  }
}

const typeAndThrowValidators: TypeAndThrowValidators = {
  [types.STRING]: validateStringAndThrow,
  [types.BOOLEAN]: validateBooleanAndThrow,
  [types.NUMBER]: validateNumberAndThrow,
  [types.OBJECT]: validateObjectAndThrow,
  [types.ARRAY]: validateArrayAndThrow,
};

function validateSchema(config: AnyObject | OptionProperties, schema: JSONSchema7, validator?: ValidateFunction): SchemaValidationResult {
  const validateProperties = validator || ajv.compile(schema);
  const valid = validateProperties(config);
  return {
    valid,
    errors: validateProperties.errors as DefinedError[],
  };
}

function formatErrors(schema: JSONSchema7, data: AnyObject | OptionProperties, errors: DefinedError[]): string {
  const formattedJson = betterAjvErrors(schema, data, errors, {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

function validateSchemaAndThrow(object: AnyObject | OptionProperties, schema: JSONSchema7, validator?: ValidateFunction): void | never {
  const { valid, errors } = validateSchema(object, schema, validator);
  if (!valid) {
    throw new Error(formatErrors(schema, object, errors as DefinedError[]));
  }
}

function addNamespaceSchema(namespace: NamespaceInterface, { rootSchema, allowAdditionalProperties }: { rootSchema?: JSONSchema7, allowAdditionalProperties: boolean }): JSONSchema7 {
  const initialSchema = rootSchema || emptySchema({ allowAdditionalProperties });
  const schema = namespace.options.reduce((currentSchema: JSONSchema7, option: OptionInterface) => {
    const properties : { [key: string]: JSONSchema7 } = {};
    if (option.nullable) {
      properties[option.name] = {
        type: [option.type as JSONSchema7TypeName, types.NULL as JSONSchema7TypeName],
      };
    } else {
      properties[option.name] = {
        type: option.type as JSONSchema7TypeName,
      };
    }

    if (optionIsArray(option)) {
      properties[option.name].items = {
        type: option.itemsType,
      } as JSONSchema7Definition;
    }
    currentSchema.properties = {
      ...currentSchema.properties,
      ...properties,
    }
    return currentSchema;
  }, initialSchema);
  addNamespacesSchema(namespace.namespaces, {
    rootSchema: initialSchema,
    allowAdditionalProperties,
  });
  return schema;
}

function addNamespacesSchema(namespaces: NamespaceInterface[], { rootSchema, allowAdditionalProperties } : { rootSchema: JSONSchema7, allowAdditionalProperties: boolean }): JSONSchema7 {
  return namespaces.reduce((currentSchema: JSONSchema7, namespace: NamespaceInterface) => {
    const properties : { [key: string]: JSONSchema7 } = {};
    if (namespace.name) {
      properties[namespace.name] = addNamespaceSchema(namespace, {
        allowAdditionalProperties,
      });
    } else {
      addNamespaceSchema(namespace, { rootSchema: currentSchema, allowAdditionalProperties });
    }
    currentSchema.properties = {
      ...currentSchema.properties,
      ...properties,
    }
    return currentSchema;
  }, rootSchema);
}

function getConfigValidationSchema({ namespaces, allowAdditionalProperties } : { namespaces: NamespaceInterface[], allowAdditionalProperties: boolean }): JSONSchema7 {
  return addNamespacesSchema(namespaces, {
    rootSchema: emptySchema({ allowAdditionalProperties }),
    allowAdditionalProperties,
  });
}

export function validateConfigAndThrow(config: AnyObject, { namespaces, allowAdditionalProperties }: { namespaces: NamespaceInterface[], allowAdditionalProperties: boolean }): void | never {
  validateSchemaAndThrow(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties })
  );
}

export function validateConfig(config: AnyObject, { namespaces, allowAdditionalProperties }: { namespaces: NamespaceInterface[], allowAdditionalProperties: boolean }): SchemaValidationResult  {
  return validateSchema(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties })
  );
}

export function getValidationSchema({ namespaces, allowAdditionalProperties }: { namespaces: NamespaceInterface[], allowAdditionalProperties: boolean }): JSONSchema7 {
  return getConfigValidationSchema({ namespaces, allowAdditionalProperties });
}

export function validateOptionAndThrow(option: OptionProperties): void | never {
  validateSchemaAndThrow(option, optionSchema, optionValidator);
}

export function validateValueTypeAndThrow(value: unknown, type: OptionType, nullable?: boolean, itemsType?: ItemsType): undefined | never {
  if (nullable && value === null) {
    return;
  }
  typeAndThrowValidators[type](value, itemsType);
}
