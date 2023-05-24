import Ajv, { ValidateFunction, DefinedError } from "ajv";
import betterAjvErrors from "better-ajv-errors";
import type { JSONSchema7TypeName, JSONSchema7, JSONSchema7Definition } from "json-schema";
import { isString, isNumber, isObject, isBoolean } from "lodash";

import type { UnknownObject } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";
import type {
  OptionDefinitionGeneric,
  OptionType,
  OptionItemsType,
  OptionInterfaceGeneric,
} from "./Option.types";
import {
  optionIsArray,
  NUMBER_TYPE,
  STRING_TYPE,
  BOOLEAN_TYPE,
  OBJECT_TYPE,
  ARRAY_TYPE,
  NULL_TYPE,
  UNKNOWN_TYPE,
} from "./Typing";
import type {
  ConfigValidationResult,
  GetValidationSchemaOptions,
  JSONSchema7WithUnknown,
} from "./Validation.types";

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

ajv.addKeyword({
  keyword: "isUnknown",
  compile: (schema: boolean) => () => schema === true,
  errors: false,
});

type AnySingleValue = unknown;
type AnyArrayValue = unknown[];
type AnyValue = AnySingleValue | AnyArrayValue;

function enforceDefaultTypeSchema({
  type,
  itemsType,
  nullable,
}: {
  type: OptionType;
  itemsType?: OptionItemsType;
  nullable?: boolean;
}): JSONSchema7WithUnknown {
  const properties: { [key: string]: JSONSchema7 } = {
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

  const defaultProperty: JSONSchema7 = {};

  if (nullable) {
    if (type !== UNKNOWN_TYPE) {
      defaultProperty.type = [type as JSONSchema7TypeName, NULL_TYPE as JSONSchema7TypeName];
    }
    properties.nullable = { enum: [true] };
  } else {
    if (type !== UNKNOWN_TYPE) {
      defaultProperty.type = type as JSONSchema7TypeName;
    }
  }

  if (itemsType) {
    properties.itemsType = { enum: [itemsType] };
    if (itemsType !== UNKNOWN_TYPE) {
      defaultProperty.items = {
        type: itemsType as JSONSchema7TypeName,
      };
    }
    schema.required = ["name", "type", "nullable", "itemsType"];
  }

  properties.default = defaultProperty;
  schema.properties = properties;

  return schema;
}

const optionSchema: JSONSchema7WithUnknown = {
  type: OBJECT_TYPE as JSONSchema7TypeName,
  oneOf: [
    enforceDefaultTypeSchema({ type: NUMBER_TYPE }),
    enforceDefaultTypeSchema({ type: NUMBER_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: STRING_TYPE }),
    enforceDefaultTypeSchema({ type: STRING_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: BOOLEAN_TYPE }),
    enforceDefaultTypeSchema({ type: BOOLEAN_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: OBJECT_TYPE }),
    enforceDefaultTypeSchema({ type: OBJECT_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: UNKNOWN_TYPE }),
    enforceDefaultTypeSchema({ type: UNKNOWN_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: NUMBER_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: NUMBER_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: STRING_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: STRING_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: BOOLEAN_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: BOOLEAN_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: OBJECT_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: OBJECT_TYPE, nullable: true }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: UNKNOWN_TYPE }),
    enforceDefaultTypeSchema({ type: ARRAY_TYPE, itemsType: UNKNOWN_TYPE, nullable: true }),
  ],
};

const optionValidator: ValidateFunction = ajv.compile(optionSchema);

function emptySchema({
  allowAdditionalProperties,
}: {
  allowAdditionalProperties: boolean;
}): JSONSchema7WithUnknown {
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
  (value: unknown | unknown[], itemsType?: OptionItemsType): Error | void;
}

interface TypeAndThrowValidators {
  [key: string]: ThrowValidator;
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

function validateArrayAndThrow(value: AnyValue, itemsType?: OptionItemsType): void | never {
  if (valueIsArray(value)) {
    if (itemsType) {
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

function validateSchema(
  config: UnknownObject | OptionDefinitionGeneric,
  schema: JSONSchema7,
  validator?: ValidateFunction
): ConfigValidationResult {
  const validateProperties = validator || ajv.compile(schema);
  const valid = validateProperties(config);
  return {
    valid,
    errors: validateProperties.errors as DefinedError[],
  };
}

function formatErrors(
  schema: JSONSchema7,
  data: UnknownObject | OptionDefinitionGeneric,
  errors: DefinedError[]
): string {
  const formattedJson = betterAjvErrors(schema, data, errors, {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

function validateSchemaAndThrow(
  object: UnknownObject | OptionDefinitionGeneric,
  schema: JSONSchema7,
  validator?: ValidateFunction
): void | never {
  const { valid, errors } = validateSchema(object, schema, validator);
  if (!valid) {
    throw new Error(formatErrors(schema, object, errors as DefinedError[]));
  }
}

function addNamespaceSchema(
  namespace: ConfigNamespaceInterface,
  {
    rootSchema,
    allowAdditionalProperties,
    removeCustomProperties,
  }: {
    rootSchema?: JSONSchema7;
    allowAdditionalProperties: boolean;
    removeCustomProperties?: boolean;
  }
): JSONSchema7WithUnknown {
  const initialSchema = rootSchema || emptySchema({ allowAdditionalProperties });
  const schema = namespace.options.reduce(
    (currentSchema: JSONSchema7WithUnknown, option: OptionInterfaceGeneric) => {
      const properties: { [key: string]: JSONSchema7WithUnknown } = {};
      if (option.type !== UNKNOWN_TYPE) {
        if (option.nullable) {
          properties[option.name] = {
            type: [option.type, NULL_TYPE] as JSONSchema7TypeName[],
          };
        } else {
          properties[option.name] = {
            type: option.type as JSONSchema7TypeName,
          };
        }
      } else {
        if (!removeCustomProperties) {
          properties[option.name] = {
            isUnknown: true,
          };
        } else {
          properties[option.name] = {};
        }
      }

      if (optionIsArray(option)) {
        if (option.itemsType !== UNKNOWN_TYPE) {
          properties[option.name].items = {
            type: option.itemsType,
          } as JSONSchema7Definition;
        } else {
          if (!removeCustomProperties) {
            properties[option.name].items = {
              isUnknown: true,
            };
          }
        }
      }
      currentSchema.properties = {
        ...currentSchema.properties,
        ...properties,
      };
      return currentSchema;
    },
    initialSchema
  );
  addNamespacesSchema(namespace.namespaces, {
    rootSchema: initialSchema,
    allowAdditionalProperties,
    removeCustomProperties,
  });
  return schema;
}

function addNamespacesSchema(
  namespaces: ConfigNamespaceInterface[],
  {
    rootSchema,
    allowAdditionalProperties,
    removeCustomProperties,
  }: {
    rootSchema: JSONSchema7;
    allowAdditionalProperties: boolean;
    removeCustomProperties?: boolean;
  }
): JSONSchema7WithUnknown {
  return namespaces.reduce((currentSchema: JSONSchema7, namespace: ConfigNamespaceInterface) => {
    const properties: { [key: string]: JSONSchema7WithUnknown } = {};
    if (!namespace.isRoot) {
      properties[namespace.name] = addNamespaceSchema(namespace, {
        allowAdditionalProperties,
        removeCustomProperties,
      });
    } else {
      addNamespaceSchema(namespace, {
        rootSchema: currentSchema,
        allowAdditionalProperties,
        removeCustomProperties,
      });
    }
    currentSchema.properties = {
      ...currentSchema.properties,
      ...properties,
    };
    return currentSchema;
  }, rootSchema);
}

function getConfigValidationSchema({
  namespaces,
  allowAdditionalProperties,
  removeCustomProperties,
}: {
  namespaces: ConfigNamespaceInterface[];
  allowAdditionalProperties: boolean;
  removeCustomProperties?: boolean;
}): JSONSchema7WithUnknown {
  return addNamespacesSchema(namespaces, {
    rootSchema: emptySchema({ allowAdditionalProperties }),
    allowAdditionalProperties,
    removeCustomProperties,
  });
}

export function validateConfigAndThrow(
  config: UnknownObject,
  {
    namespaces,
    allowAdditionalProperties,
    removeCustomProperties,
  }: {
    namespaces: ConfigNamespaceInterface[];
    allowAdditionalProperties: boolean;
    removeCustomProperties?: boolean;
  }
): void | never {
  validateSchemaAndThrow(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties, removeCustomProperties })
  );
}

export function validateConfig(
  config: UnknownObject,
  {
    namespaces,
    allowAdditionalProperties,
    removeCustomProperties,
  }: {
    namespaces: ConfigNamespaceInterface[];
    allowAdditionalProperties: boolean;
    removeCustomProperties?: boolean;
  }
): ConfigValidationResult {
  return validateSchema(
    config,
    getConfigValidationSchema({ namespaces, allowAdditionalProperties, removeCustomProperties })
  );
}

export function getValidationSchema({
  namespaces,
  allowAdditionalProperties,
  removeCustomProperties,
}: GetValidationSchemaOptions): JSONSchema7WithUnknown {
  return getConfigValidationSchema({
    namespaces,
    allowAdditionalProperties,
    removeCustomProperties,
  });
}

export function validateOptionAndThrow(option: OptionDefinitionGeneric): void | never {
  validateSchemaAndThrow(option, optionSchema, optionValidator);
}

export function validateValueTypeAndThrow(
  value: unknown,
  type: OptionType,
  nullable?: boolean,
  itemsType?: OptionItemsType
): undefined | never {
  if ((nullable && value === null) || type === UNKNOWN_TYPE) {
    return;
  }
  typeAndThrowValidators[type](value, itemsType);
}
