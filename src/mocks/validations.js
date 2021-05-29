/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Ajv = require("ajv");
const { compact } = require("lodash");

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
      errorMessage: 'Property "id" should be string',
    },
    from: {
      type: "string",
      errorMessage: 'Property "from" should be string',
    },
    routesVariants: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
      errorMessage: 'Property "routesVariants" should be an array of strings with unique items',
    },
  },
  required: ["id", "routesVariants"],
  additionalProperties: {
    not: true,
    errorMessage: "Extra property ${0#} is not allowed",
  },
  errorMessage: {
    type: "Should be an object",
    required: {
      id: 'Should have a string property "id"',
      routesVariants: 'Should have a property "routesVariants"',
    },
  },
};

const routesSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      errorMessage: 'Property "id" should be string',
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
      errorMessage: 'Property "url" should be a string or a RegExp',
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
      errorMessage: `Property "method" should be a string or an array with unique items. Allowed values for "method" are "${validHttpMethods.join(
        ","
      )}"`,
    },
    delay: {
      type: "integer",
      minimum: 0,
      errorMessage: `Property "delay" should be a positive integer`,
    },
    variants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            errorMessage: 'Property "id" should be string in variant ${1#}',
          },
          handler: {
            type: "string",
            enum: [], // this enum is defined when validator is compiled
            errorMessage: "", // this error message is defined when validator is compiled
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
            errorMessage:
              'Property "delay" should be a positive integer or "null" in variant ${1#}',
          },
        },
        required: ["id"],
        errorMessage: {
          type: "Variant ${0#} should be an object",
          required: {
            id: 'Should have a string property "id" in variant ${0#}',
          },
        },
      },
      errorMessage: `Property "variants" should be an array`,
    },
  },
  required: ["id", "url", "method", "variants"],
  additionalProperties: {
    not: true,
    errorMessage: "Extra property ${0#} is not allowed",
  },
  errorMessage: {
    type: "Should be an object",
    required: {
      id: 'Should have a string property "id"',
      url: 'Should have a property "url"',
      method: 'Should have a property "method"',
      variants: 'Should have a property "variants"',
    },
  },
};

let validatorInited, mockValidator, routeValidator, originalMockValidator, originalRouteValidator;

function undoInitValidator() {
  if (validatorInited) {
    validatorInited = false;
    originalMockValidator = mockValidator;
    mockValidator = null;
    originalRouteValidator = routeValidator;
    routeValidator = null;
  }
}

function restoreValidator() {
  if (!validatorInited) {
    validatorInited = true;
    mockValidator = originalMockValidator;
    routeValidator = originalRouteValidator;
  }
}

function fooValidator() {
  return true;
}

function initValidator() {
  const initAjvErrors = require("ajv-errors");
  initAjvErrors(ajv, { singleError: true, keepErrors: false });
  mockValidator = ajv.compile(mocksSchema);
  validatorInited = true;
}

function catchInitValidatorError() {
  let error = null;
  if (!validatorInited) {
    try {
      initValidator();
    } catch (err) {
      error = err;
      mockValidator = fooValidator;
    }
  }
  return error;
}

function getIds(objs) {
  return objs.map((obj) => obj.id);
}

function compileRouteValidator(routesHandlers) {
  if (validatorInited) {
    const supportedRouteHandlersIds = getIds(routesHandlers);
    routesSchema.properties.variants.items.properties.handler.enum = supportedRouteHandlersIds;
    routesSchema.properties.variants.items.properties.handler.errorMessage = `Property "handler" should be one of "${supportedRouteHandlersIds.join(
      ","
    )}" in variant \${1#}`;
    routeValidator = ajv.compile(routesSchema);
  } else {
    routeValidator = fooValidator;
  }
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

function validationSingleMessage(errors) {
  return errors
    .reduce((messages, error) => {
      if (error.message.length) {
        messages.push(error.message);
      }
      return messages;
    }, [])
    .join(". ");
}

function findRouteVariantByVariantId(routesVariants, variantId) {
  return routesVariants.find((routeVariant) => routeVariant.variantId === variantId);
}

function notFoundRouteVariantMessage(variantId) {
  return {
    message: `routeVariant with id "${variantId}" was not found, use a valid "routeId:variantId" identifier`,
  };
}

function duplicatedRouteMessage(routeId) {
  return {
    message: `route with id "${routeId}" is used more than once in the same mock`,
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

function mockErrorsMessage(mock, errors) {
  const idTrace = mock && mock.id ? `with id "${mock.id}" ` : "";
  return `Mock ${idTrace}is invalid: ${validationSingleMessage(errors)}`;
}

function mockRouteVariantsValidationErrors(mock, routeVariants) {
  const invalidRouteVariants = mockInvalidRouteVariants(mock, routeVariants);
  if (invalidRouteVariants.errors.length) {
    return {
      message: mockErrorsMessage(mock, invalidRouteVariants.errors),
      errors: invalidRouteVariants.errors,
    };
  }
  return null;
}

function mockValidationErrors(mock) {
  const isValid = mockValidator(mock);
  if (!isValid) {
    return {
      message: mockErrorsMessage(mock, mockValidator.errors),
      errors: mockValidator.errors,
    };
  }
  return null;
}

function routeValidationErrors(route) {
  const isValid = routeValidator(route);
  if (!isValid) {
    const idTrace = route && route.id ? `with id "${route.id}" ` : "";
    return {
      message: `Route ${idTrace}is invalid: ${validationSingleMessage(routeValidator.errors)}`,
      errors: routeValidator.errors,
    };
  }
  return null;
}

function variantValidationErrors(route, variant, Handler) {
  if (!Handler.validationSchema || !validatorInited) {
    return null;
  }
  const variantValidator = ajv.compile(Handler.validationSchema);
  const isValid = variantValidator(variant);
  if (!isValid) {
    const idTrace = variant && variant.id ? `with id "${variant.id}" ` : "";
    return {
      message: `Variant ${idTrace}in route with id "${
        route.id
      }" is invalid: ${validationSingleMessage(variantValidator.errors)}`,
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
  catchInitValidatorError,
  initValidator,
  // use only for testing
  undoInitValidator,
  restoreValidator,
};
