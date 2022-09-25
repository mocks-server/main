import Ajv, { ValidateFunction, DefinedError } from "ajv"
import betterAjvErrors from "better-ajv-errors";
import { isString, isNumber, isObject, isBoolean } from "lodash";

import { optionIsArray, NUMBER_TYPE, STRING_TYPE, BOOLEAN_TYPE, OBJECT_TYPE, ARRAY_TYPE, NULL_TYPE } from "./types";

import type { JSONSchema7TypeName, JSONSchema7, JSONSchema7Definition } from "json-schema"
import type { AnyObject } from "./types/Common";
import type { OptionProperties, OptionInterface, OptionType, ItemsType } from "./types/Option";
import type { NamespaceInterface } from "./types/Config";
import type { SchemaValidationResult, GetValidationSchemaOptions } from "./types/Validation";

const ajv = new Ajv({ allErrors: true });

type AnySingleValue = unknown
type AnyArrayValue = unknown[]
type AnyValue = AnySingleValue | AnyArrayValue

function enforceDefaultTypeSchema({ type, itemsType, nullable } : { type: OptionType, itemsType?: ItemsType, nullable?: boolean }): JSONSchema7 {
  const properties : { [key: string]: JSONSchema7 } = {
    name: { type: STRING_TYPE as JSONSchema7TypeName },
    type: { enum: [type] },
    nullable: { enum: [false] },
    description: { type: STRING_TYPE as JSONSchema7TypeName },
    extraData: {
      type: OBJECT_TYPE as JSONSchema7TypeName,
      additionalProperties: true,
    },
  };

  const schema: JSONSchema7 = {
    additionalProperties: false,
    required: ["name", "type", "nullable"],
  };

  const defaultProperty: JSONSchema7 = {}

  if (nullable) {
    defaultProperty.type = [type as JSONSchema7TypeName, NULL_TYPE as JSONSchema7TypeName];
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
  type: OBJECT_TYPE as JSONSchema7TypeName,
  oneOf: [
    enforceDefaultTypeSchema({ type: NUMBER_TYPE }),
    enforceDefaultTypeSchema({ type: NUMBER_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: STRING_TYPE }),
    enforceDefaultTypeSchema({ type: STRING_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: BOOLEAN_TYPE }),
    enforceDefaultTypeSchema({ type: BOOLEAN_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: OBJECT_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: NUMBER_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: STRING_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: BOOLEAN_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: OBJECT_TYPE }),
  ],
};

const optionValidator : ValidateFunction = ajv.compile(optionSchema);

function emptySchema({ allowAdditionalProperties } : { allowAdditionalProperties: boolean }): JSONSchema7 {
  return {
    type: OBJECT_TYPE as JSONSchema7TypeName,
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
    throwValueTypeError(value, STRING_TYPE);
  }
}

function validateBooleanAndThrow(value: unknown): void | never {
  if (!isBoolean(value)) {
    throwValueTypeError(value, BOOLEAN_TYPE);
  }
}

function validateNumberAndThrow(value: unknown): void | never {
  if (!isNumber(value)) {
    throwValueTypeError(value, NUMBER_TYPE);
  }
}

function validateObjectAndThrow(value: unknown): void | never {
  if (!isObject(value)) {
    throwValueTypeError(value, OBJECT_TYPE);
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
    throwValueTypeError(value, ARRAY_TYPE);
  }
}

const typeAndThrowValidators: TypeAndThrowValidators = {
  [STRING_TYPE]: validateStringAndThrow,
  [BOOLEAN_TYPE]: validateBooleanAndThrow,
  [NUMBER_TYPE]: validateNumberAndThrow,
  [OBJECT_TYPE]: validateObjectAndThrow,
  [ARRAY_TYPE]: validateArrayAndThrow,
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
        type: [option.type as JSONSchema7TypeName, NULL_TYPE as JSONSchema7TypeName],
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
    if (!namespace.isRoot) {
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

export function getValidationSchema({ namespaces, allowAdditionalProperties }: GetValidationSchemaOptions): JSONSchema7 {
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
