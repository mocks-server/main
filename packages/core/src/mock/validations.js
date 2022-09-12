/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Ajv = require("ajv");
const { compact } = require("lodash");
const betterAjvErrors = require("better-ajv-errors").default;

const { getDataFromVariant } = require("../variant-handlers/helpers");

const ajv = new Ajv({ allErrors: true });

const HTTP_METHODS = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  DELETE: "delete",
  PUT: "put",
  OPTIONS: "options",
  HEAD: "head",
  TRACE: "trace",
};

const ALL_HTTP_METHODS = Object.keys(HTTP_METHODS).map((methodKey) => {
  return HTTP_METHODS[methodKey];
});

const ALL_HTTP_METHODS_ALIAS = "*";

const CLASSES = { Function: Function, RegExp: RegExp };

const validHttpMethods = objectKeys(HTTP_METHODS);
const validHttpMethodsLowerAndUpper = arrayLowerAndUpper(validHttpMethods);

ajv.addKeyword({
  keyword: "instanceof",
  compile: (schema) => (data) => data instanceof CLASSES[schema],
  errors: false,
});

const collectionsSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    from: {
      type: ["string", "null"],
    },
    routes: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
    },
  },
  required: ["id", "routes"],
  additionalProperties: false,
};

const routesSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    url: {
      oneOf: [
        {
          type: "string",
        },
        {
          instanceof: "RegExp",
        },
      ],
    },
    method: {
      oneOf: [
        {
          type: "string",
          enum: [...validHttpMethodsLowerAndUpper, ALL_HTTP_METHODS_ALIAS],
        },
        {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
            enum: validHttpMethodsLowerAndUpper,
          },
        },
      ],
    },
    delay: {
      type: "integer",
      minimum: 0,
    },
    variants: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              disabled: {
                enum: [false],
              },
              type: {
                type: "string",
                enum: [], // this enum is defined when validator is compiled
              },
              delay: {
                oneOf: [
                  {
                    type: "null",
                  },
                  {
                    type: "integer",
                    minimum: 0,
                  },
                ],
              },
              options: {
                type: "object",
              },
            },
            required: ["id", "type"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              disabled: {
                enum: [true],
              },
            },
            required: ["id"],
            additionalProperties: false,
          },
        ],
      },
    },
  },
  required: ["id", "url", "variants"],
  additionalProperties: false,
};

const disabledVariantSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    disabled: {
      type: "boolean",
    },
  },
  required: ["id", "disabled"],
  additionalProperties: false,
};

const collectionValidator = ajv.compile(collectionsSchema);

let routeValidator, routeSchema;

function getIds(objs) {
  return objs.map((obj) => obj.id);
}

function compileRouteValidator(variantHandlers) {
  const supportedRouteHandlersIds = getIds(variantHandlers);
  const schema = { ...routesSchema };
  schema.properties.variants.items.oneOf[0].properties.type.enum = supportedRouteHandlersIds;
  routeSchema = { ...schema };
  routeValidator = ajv.compile(schema);
}

function toLowerCase(str) {
  return str.toLowerCase();
}

function arrayToLowerCase(array) {
  return array.map(toLowerCase);
}

function objectKeys(obj) {
  return Object.keys(obj);
}

function arrayLowerAndUpper(array) {
  return array.concat(arrayToLowerCase(array));
}

function customValidationSingleMessage(errors) {
  return errors
    .reduce((messages, error) => {
      if (error.message.length) {
        messages.push(error.message);
      }
      return messages;
    }, [])
    .join(". ");
}

function validationSingleMessage(schema, data, errors) {
  const formattedJson = betterAjvErrors(schema, data || {}, errors, {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

function routeValidationMessage(data, errors) {
  return validationSingleMessage(routeSchema, data, errors);
}

function collectionValidationMessage(data, errors) {
  return validationSingleMessage(collectionsSchema, data, errors);
}

function findRouteVariantByVariantId(routeVariants, variantId) {
  return routeVariants.find((routeVariant) => routeVariant.variantId === variantId);
}

function traceId(id) {
  return `with id '${id}'`;
}

function notFoundRouteVariantMessage(variantId) {
  return {
    message: `routeVariant ${traceId(
      variantId
    )} was not found, use a valid 'routeId:variantId' identifier`,
  };
}

function duplicatedRouteMessage(routeId) {
  return {
    message: `route ${traceId(routeId)} is used more than once in the same collection`,
  };
}

function collectionRouteVariantsErrors(variants, routeVariants) {
  let routes = [];
  return compact(
    variants.map((variantId) => {
      const routeVariant = findRouteVariantByVariantId(routeVariants, variantId);
      if (!routeVariant) {
        return notFoundRouteVariantMessage(variantId);
      }
      if (routes.includes(routeVariant.routeId)) {
        return duplicatedRouteMessage(routeVariant.routeId);
      }
      routes.push(routeVariant.routeId);
      return null;
    })
  );
}

function getCollectionRouteVariantsProperty(collection) {
  return collection.routes || collection.routeVariants;
}

function collectionInvalidRouteVariants(collection, routeVariants) {
  const variantsInCollection = collection && getCollectionRouteVariantsProperty(collection);
  const variants =
    variantsInCollection && Array.isArray(variantsInCollection) ? variantsInCollection : [];
  return {
    errors: collectionRouteVariantsErrors(variants, routeVariants),
  };
}

function collectionErrorsMessagePrefix(collection) {
  const idTrace = collection && collection.id ? `${traceId(collection.id)} ` : "";
  return `Collection ${idTrace}is invalid:`;
}

function collectionRouteVariantsValidationErrors(collection, routeVariants) {
  const invalidRouteVariants = collectionInvalidRouteVariants(collection, routeVariants);
  if (invalidRouteVariants.errors.length) {
    return {
      message: `${collectionErrorsMessagePrefix(collection)} ${customValidationSingleMessage(
        invalidRouteVariants.errors
      )}`,
      errors: invalidRouteVariants.errors,
    };
  }
  return null;
}

function collectionValidationErrors(collection) {
  const isValid = collectionValidator(collection);
  if (!isValid) {
    return {
      message: `${collectionErrorsMessagePrefix(collection)} ${collectionValidationMessage(
        collection,
        collectionValidator.errors
      )}`,
      errors: collectionValidator.errors,
    };
  }
  return null;
}

function routeValidationErrors(route) {
  const isValid = routeValidator(route);
  if (!isValid) {
    const idTrace = route && route.id ? `${traceId(route.id)} ` : "";
    return {
      message: `Route ${idTrace}is invalid: ${routeValidationMessage(
        route,
        routeValidator.errors
      )}`,
      errors: routeValidator.errors,
    };
  }
  return null;
}

function variantDisabledValidationErrors(route, variant) {
  const variantValidator = ajv.compile(disabledVariantSchema);
  const dataToCheck = variant;
  const isValid = variantValidator(dataToCheck);
  if (!isValid) {
    const validationMessage = validationSingleMessage(
      disabledVariantSchema,
      dataToCheck,
      variantValidator.errors
    );
    const idTrace = variant && variant.id ? `${traceId(variant.id)} ` : "";
    return {
      message: `Variant ${idTrace}in route ${traceId(route.id)} is invalid: ${validationMessage}`,
      errors: variantValidator.errors,
    };
  }
  return null;
}

function variantValidationErrors(route, variant, Handler) {
  if (!Handler.validationSchema) {
    return null;
  }
  const variantValidator = ajv.compile(Handler.validationSchema);
  const dataToCheck = getDataFromVariant(variant);
  const dataMessage = "Invalid 'options' property:";
  const isValid = variantValidator(dataToCheck);
  if (!isValid) {
    let validationMessage;
    try {
      validationMessage = validationSingleMessage(
        Handler.validationSchema,
        dataToCheck || {},
        variantValidator.errors
      );
    } catch (error) {
      validationMessage = " Wrong type";
    }
    const idTrace = variant && variant.id ? `${traceId(variant.id)} ` : "";
    return {
      message: `Variant ${idTrace}in route ${traceId(
        route.id
      )} is invalid: ${dataMessage}${validationMessage}`,
      errors: variantValidator.errors,
    };
  }
  return null;
}

module.exports = {
  HTTP_METHODS,
  ALL_HTTP_METHODS_ALIAS,
  ALL_HTTP_METHODS,
  getIds,
  collectionValidationErrors,
  routeValidationErrors,
  variantValidationErrors,
  variantDisabledValidationErrors,
  compileRouteValidator,
  validationSingleMessage,
  findRouteVariantByVariantId,
  collectionRouteVariantsValidationErrors,
  customValidationSingleMessage,
  getCollectionRouteVariantsProperty,
};
