/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Ajv = require("ajv");
const { compact } = require("lodash");
const betterAjvErrors = require("better-ajv-errors").default;

const { getDataFromVariant, isVersion4 } = require("../variant-handlers/helpers");

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

const CLASSES = { Function: Function, RegExp: RegExp };

const validHttpMethods = objectKeys(HTTP_METHODS);
const validHttpMethodsLowerAndUpper = arrayLowerAndUpper(validHttpMethods);

ajv.addKeyword({
  keyword: "instanceof",
  compile: (schema) => (data) => data instanceof CLASSES[schema],
  errors: false,
});

const mocksSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    from: {
      type: "string",
    },
    routesVariants: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
    },
  },
  required: ["id", "routesVariants"],
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
          enum: validHttpMethodsLowerAndUpper,
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
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          handler: {
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
        },
        // TODO, require "response" in all variants to be an object, do not allow additionalProperties
        required: ["id"],
      },
    },
  },
  required: ["id", "url", "method", "variants"],
  additionalProperties: false,
};

const mockValidator = ajv.compile(mocksSchema);

let routeValidator, routeSchema;

function getIds(objs) {
  return objs.map((obj) => obj.id);
}

function compileRouteValidator(routesHandlers) {
  const supportedRouteHandlersIds = getIds(routesHandlers);
  const schema = { ...routesSchema };
  schema.properties.variants.items.properties.handler.enum = supportedRouteHandlersIds;
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
  const formattedJson = betterAjvErrors(schema, data, errors, {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

function routeValidationMessage(data, errors) {
  return validationSingleMessage(routeSchema, data, errors);
}

function mockValidationMessage(data, errors) {
  return validationSingleMessage(mocksSchema, data, errors);
}

function findRouteVariantByVariantId(routesVariants, variantId) {
  return routesVariants.find((routeVariant) => routeVariant.variantId === variantId);
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
    message: `route ${traceId(routeId)} is used more than once in the same mock`,
  };
}

function mockRouteVariantsErrors(variants, routeVariants) {
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

function mockInvalidRouteVariants(mock, routeVariants) {
  const variants =
    mock && mock.routesVariants && Array.isArray(mock.routesVariants) ? mock.routesVariants : [];
  return {
    errors: mockRouteVariantsErrors(variants, routeVariants),
  };
}

function mockErrorsMessagePrefix(mock) {
  const idTrace = mock && mock.id ? `${traceId(mock.id)} ` : "";
  return `Mock ${idTrace}is invalid:`;
}

function mockRouteVariantsValidationErrors(mock, routeVariants) {
  const invalidRouteVariants = mockInvalidRouteVariants(mock, routeVariants);
  if (invalidRouteVariants.errors.length) {
    return {
      message: `${mockErrorsMessagePrefix(mock)} ${customValidationSingleMessage(
        invalidRouteVariants.errors
      )}`,
      errors: invalidRouteVariants.errors,
    };
  }
  return null;
}

function mockValidationErrors(mock) {
  const isValid = mockValidator(mock);
  if (!isValid) {
    return {
      message: `${mockErrorsMessagePrefix(mock)} ${mockValidationMessage(
        mock,
        mockValidator.errors
      )}`,
      errors: mockValidator.errors,
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

function variantValidationErrors(route, variant, Handler) {
  if (!Handler.validationSchema) {
    return null;
  }
  const variantValidator = ajv.compile(Handler.validationSchema);
  const dataToCheck = getDataFromVariant(variant, Handler);
  const dataMessage = isVersion4(Handler) ? "Invalid 'response' property:" : "";
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
  getIds,
  mockValidationErrors,
  routeValidationErrors,
  variantValidationErrors,
  compileRouteValidator,
  validationSingleMessage,
  findRouteVariantByVariantId,
  mockRouteVariantsValidationErrors,
  customValidationSingleMessage,
};
