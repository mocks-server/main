/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true });
const initAjvErrors = require("ajv-errors");
const { flatten, compact } = require("lodash");

const tracer = require("../tracer");

const DEFAULT_ROUTES_HANDLER = "default";

const CLASSES = { Function: Function, RegExp: RegExp };

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

const validHttpMethods = objectKeys(HTTP_METHODS);
const validHttpMethodsLowerAndUpper = arrayLowerAndUpper(validHttpMethods);

initAjvErrors(ajv, { singleError: true, keepErrors: false });

ajv.addKeyword({
  keyword: "instanceof",
  compile: (schema) => (data) => data instanceof CLASSES[schema],
  errors: false,
});

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
            type: "integer",
            minimum: 0,
            errorMessage: 'Property "delay" should be a positive integer in variant ${1#}',
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
    },
  },
  required: ["id", "url", "method"],
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
    },
  },
};

let routeValidator;

function compileRouteValidator(routesHandlers) {
  const supportedRouteHandlersIds = getIds(routesHandlers);
  routesSchema.properties.variants.items.properties.handler.enum = supportedRouteHandlersIds;
  routesSchema.properties.variants.items.properties.handler.errorMessage = `Property "handler" should be one of "${supportedRouteHandlersIds.join(
    ","
  )}" in variant \${1#}`;
  routeValidator = ajv.compile(routesSchema);
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

function findEqualRouteVariant(routesVariants, routeVariantToFind) {
  return routesVariants.find((routeVariant) => {
    return routeVariant.routeId === routeVariantToFind.routeId;
  });
}

function addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd) {
  const replacedMocksRoutesVariants = mockRoutesVariants.reduce((result, mockRouteVariant) => {
    const routesVariantToReplace = findEqualRouteVariant(routesVariantsToAdd, mockRouteVariant);
    result.push(routesVariantToReplace || mockRouteVariant);
    return result;
  }, []);

  routesVariantsToAdd.forEach((routeVariantToAdd) => {
    const hasBeenReplaced = !!findEqualRouteVariant(
      replacedMocksRoutesVariants,
      routeVariantToAdd
    );
    if (!hasBeenReplaced) {
      replacedMocksRoutesVariants.push(routeVariantToAdd);
    }
  });
  return replacedMocksRoutesVariants;
}

function getMockRoutesVariants(mock, mocks, routesVariants, routesVariantsToAdd = []) {
  const mockRoutesVariants = mock.routesVariants
    .map((routeId) => {
      // TODO, add alert if not found
      return routesVariants.find((routeVariant) => routeVariant.variantId === routeId);
    })
    .filter((route) => !!route);
  if (mock.from) {
    const from = mocks.find((mockCandidate) => mockCandidate.id === mock.from);
    if (from) {
      return getMockRoutesVariants(
        from,
        mocks,
        routesVariants,
        addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd)
      );
    } // TODO, add alert if from is not found
  }
  return addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd);
}

function getVariantId(routeId, variantId) {
  return `${routeId}:${variantId}`;
}

function getPlainMocks(mocks, mocksDefinitions) {
  return mocks.map((mock) => {
    const mockDefinition = mocksDefinitions.find((mockCandidate) => mockCandidate.id === mock.id);
    return {
      id: mock.id,
      from: (mockDefinition && mockDefinition.from) || null,
      routesVariants: mockDefinition && mockDefinition.routesVariants,
      appliedRoutesVariants: mock.routesVariants.map((routeVariant) => routeVariant.variantId),
    };
  });
}

function getPlainRoutes(routes, routesVariants) {
  return routes.map((route) => {
    return {
      id: route.id,
      url: route.url,
      method: route.method,
      delay: route.delay || null,
      variants: route.variants
        .map((variant) => {
          const variantId = getVariantId(route.id, variant.id);
          const variantHandler = routesVariants.find(
            (routeVariant) => routeVariant.variantId === variantId
          );
          if (variantHandler) {
            return variantId;
          }
        })
        .filter((variant) => !!variant),
    };
  });
}

function getPlainRoutesVariants(routesVariants) {
  return routesVariants.map((routeVariant) => {
    return {
      id: routeVariant.variantId,
      routeId: routeVariant.routeId,
      handler: routeVariant.constructor.id,
      response: routeVariant.plainResponsePreview,
      delay: routeVariant.delay,
    };
  });
}

function addCustomVariant(variantId, customVariants) {
  const newCustomVariants = [...customVariants];
  let inserted = false;
  newCustomVariants.forEach((customVariantId, index) => {
    // TODO, use better method, store base id and variant id in an object to avoid conflicts with possible routes ids containing :
    if (!inserted && customVariantId.split(":")[0] === variantId.split(":")[0]) {
      newCustomVariants.splice(index, 1, variantId);
      inserted = true;
    }
  });
  if (!inserted) {
    newCustomVariants.push(variantId);
  }
  return newCustomVariants;
}

function getIds(objs) {
  return objs.map((obj) => obj.id);
}

function hasDelayPropery(obj) {
  return obj.hasOwnProperty("delay");
}

function getRouteHandlerDelay(variant, route) {
  if (hasDelayPropery(variant)) {
    return variant.delay;
  }
  if (hasDelayPropery(route)) {
    return route.delay;
  }
  return null;
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
  if (!Handler.validationSchema) {
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
}

function findRouteHandler(routeHandlers, handlerId) {
  return routeHandlers.find((routeHandlerCandidate) => routeHandlerCandidate.id === handlerId);
}

function getRouteHandler({
  route,
  variant,
  variantIndex,
  routeHandlers,
  core,
  addAlert,
  alertScope,
}) {
  const variantId = getVariantId(route.id, variant.id);
  const handlerId = variant.handler || DEFAULT_ROUTES_HANDLER;
  const Handler = findRouteHandler(routeHandlers, handlerId);
  const variantErrors = variantValidationErrors(route, variant, Handler);
  if (!!variantErrors) {
    addAlert(`${alertScope}:${variantIndex}`, variantErrors.message);
    tracer.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
    return null;
  }

  const routeHandler = new Handler(
    {
      ...variant,
      variantId,
      url: route.url,
      method: route.method,
    },
    core
  );
  routeHandler.delay = getRouteHandlerDelay(variant, route);
  routeHandler.id = variant.id;
  routeHandler.variantId = variantId;
  routeHandler.routeId = route.id;
  routeHandler.url = route.url;
  routeHandler.method = route.method;
  return routeHandler;
}

function getRouteVariants({ routesDefinitions, addAlert, routeHandlers, core }) {
  return compact(
    flatten(
      routesDefinitions.map((route, index) => {
        const routeErrors = routeValidationErrors(route);
        const alertScope = `validation:route:${index}`;
        if (!!routeErrors) {
          addAlert(alertScope, routeErrors.message);
          tracer.silly(`Route validation errors: ${JSON.stringify(routeErrors.errors)}`);
          return null;
        }
        return route.variants.map((variant, index) => {
          return getRouteHandler({
            route,
            variant,
            variantIndex: index,
            routeHandlers,
            core,
            addAlert,
            alertScope,
          });
        });
      })
    )
  );
}

module.exports = {
  getMockRoutesVariants,
  getVariantId,
  getPlainMocks,
  getPlainRoutes,
  getPlainRoutesVariants,
  addCustomVariant,
  getIds,
  getRouteHandlerDelay,
  routeValidationErrors,
  HTTP_METHODS,
  compileRouteValidator,
  getRouteHandler,
  getRouteVariants,
};
