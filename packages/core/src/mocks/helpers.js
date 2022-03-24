/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { flatten, compact } = require("lodash");

const tracer = require("../tracer");
const Mock = require("./Mock");
const {
  variantValidationErrors,
  routeValidationErrors,
  mockValidationErrors,
  findRouteVariantByVariantId,
  mockRouteVariantsValidationErrors,
} = require("./validations");

const DEFAULT_ROUTES_HANDLER = "default";

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

function getMockRoutesVariants(
  mock,
  mocks,
  routesVariants,
  addAlert,
  alertScope,
  routesVariantsToAdd = []
) {
  const mockRoutesVariants = compact(
    mock.routesVariants.map((variantId) => {
      return findRouteVariantByVariantId(routesVariants, variantId);
    })
  );
  if (mock.from) {
    const from = mocks.find((mockCandidate) => mockCandidate.id === mock.from);
    if (from) {
      return getMockRoutesVariants(
        from,
        mocks,
        routesVariants,
        addAlert,
        alertScope,
        addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd)
      );
    }
    // TODO, throw an error in strict validation mode
    addAlert(
      `${alertScope}:from`,
      `Mock with invalid "from" property detected, "${mock.from}" was not found`
    );
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

function getPlainRouteVariants(route, routesVariants) {
  if (!route.variants || !Array.isArray(route.variants)) {
    return [];
  }
  return compact(
    route.variants.map((variant) => {
      if (!variant) {
        return null;
      }
      const variantId = getVariantId(route.id, variant.id);
      const variantHandler = routesVariants.find(
        (routeVariant) => routeVariant.variantId === variantId
      );
      if (variantHandler) {
        return variantId;
      }
    })
  );
}

function getPlainRoutes(routes, routesVariants) {
  let ids = [];
  return compact(
    routes.map((route) => {
      if (
        !route ||
        !route.id ||
        ids.includes(route.id) ||
        !routesVariants.find((routeVariant) => routeVariant.routeId === route.id)
      ) {
        return null;
      }
      ids.push(route.id);
      return {
        id: route.id,
        url: route.url,
        method: route.method,
        delay: hasDelayProperty(route) ? route.delay : null,
        variants: getPlainRouteVariants(route, routesVariants),
      };
    })
  );
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

function hasDelayProperty(obj) {
  return obj.hasOwnProperty("delay");
}

function getRouteHandlerDelay(variant, route) {
  if (hasDelayProperty(variant)) {
    return variant.delay;
  }
  if (hasDelayProperty(route)) {
    return route.delay;
  }
  return null;
}

function findRouteHandler(routeHandlers, handlerId) {
  return routeHandlers.find((routeHandlerCandidate) => routeHandlerCandidate.id === handlerId);
}

function getVariantHandler({
  route,
  variant,
  variantIndex,
  routeHandlers,
  core,
  addAlert,
  removeAlerts,
  alertScope,
  processAlertScope,
}) {
  let routeHandler = null;
  const variantId = getVariantId(route.id, variant.id);
  const handlerId = variant.handler || DEFAULT_ROUTES_HANDLER;
  const Handler = findRouteHandler(routeHandlers, handlerId);
  const variantErrors = variantValidationErrors(route, variant, Handler);
  if (!!variantErrors) {
    addAlert(`${alertScope}:${variantIndex}`, variantErrors.message);
    tracer.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
    return null;
  }
  const processVariantAlertScope = `${processAlertScope}:variant:${variantIndex}`;
  removeAlerts(processVariantAlertScope);

  try {
    routeHandler = new Handler(
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
  } catch (error) {
    addAlert(processVariantAlertScope, error.message);
    tracer.error(`Error processing route variant: ${error.message}`);
  }
  return routeHandler;
}

function getRouteVariants({ routesDefinitions, addAlert, removeAlerts, routeHandlers, core }) {
  let routeIds = [];
  removeAlerts("validation:route");
  removeAlerts("process:route");
  return compact(
    flatten(
      routesDefinitions.map((route, index) => {
        let routeVariantsIds = [];
        const routeErrors = routeValidationErrors(route);
        const alertScope = `validation:route:${index}`;
        const processAlertScope = `process:route:${index}`;
        if (!!routeErrors) {
          addAlert(alertScope, routeErrors.message);
          tracer.silly(`Route validation errors: ${JSON.stringify(routeErrors.errors)}`);
          return null;
        }
        if (routeIds.includes(route.id)) {
          addAlert(
            `${alertScope}:duplicated`,
            `Route with duplicated id "${route.id}" detected. It has been ignored`
          );
          return null;
        }
        routeIds.push(route.id);

        return route.variants.map((variant, variantIndex) => {
          const variantHandler = getVariantHandler({
            route,
            variant,
            variantIndex,
            routeHandlers,
            core,
            addAlert,
            removeAlerts,
            alertScope,
            processAlertScope,
          });
          if (variantHandler) {
            if (routeVariantsIds.includes(variantHandler.id)) {
              addAlert(
                `${alertScope}:variant:${variantIndex}:duplicated`,
                `Route variant with duplicated id "${variantHandler.id}" detected in route "${route.id}". It has been ignored`
              );
              return null;
            }
            routeVariantsIds.push(variantHandler.id);
          }
          return variantHandler;
        });
      })
    )
  );
}

function getMock({
  mockDefinition,
  mockIndex,
  mocksDefinitions,
  routeVariants,
  getGlobalDelay,
  addAlert,
  removeAlerts,
}) {
  let mock = null;
  const alertScope = `validation:mock:${mockIndex}`;
  const alertVariantsScope = `${alertScope}:variants`;
  const processAlertScope = `process:mock:${mockIndex}`;
  removeAlerts(alertScope);
  removeAlerts(processAlertScope);

  const mockRouteVariantsErrors = mockRouteVariantsValidationErrors(mockDefinition, routeVariants);
  if (!!mockRouteVariantsErrors) {
    addAlert(alertVariantsScope, mockRouteVariantsErrors.message);
    tracer.silly(
      `Mock variants validation errors: ${JSON.stringify(mockRouteVariantsErrors.errors)}`
    );
    // TODO, add strict validation mode
    // return null;
  }

  const mockErrors = mockValidationErrors(mockDefinition, routeVariants);
  if (!!mockErrors) {
    addAlert(alertScope, mockErrors.message);
    tracer.silly(`Mock validation errors: ${JSON.stringify(mockErrors.errors)}`);
    return null;
  }

  try {
    mock = new Mock({
      id: mockDefinition.id,
      routesVariants: getMockRoutesVariants(
        mockDefinition,
        mocksDefinitions,
        routeVariants,
        addAlert,
        alertScope
      ),
      getDelay: getGlobalDelay,
    });
  } catch (error) {
    addAlert(processAlertScope, error.message);
    tracer.error(`Error processing mock: ${error.message}`);
  }
  return mock;
}

function getMocks({ mocksDefinitions, addAlert, removeAlerts, routeVariants, getGlobalDelay }) {
  removeAlerts("process:mocks");
  let errorsProcessing = 0;
  let ids = [];
  const mocks = compact(
    mocksDefinitions.map((mockDefinition, index) => {
      const mock = getMock({
        mockDefinition,
        mockIndex: index,
        mocksDefinitions,
        routeVariants,
        getGlobalDelay,
        addAlert,
        removeAlerts,
      });
      if (!mock) {
        errorsProcessing++;
        return null;
      }
      if (ids.includes(mock.id)) {
        addAlert(
          `process:mocks:${index}:duplicated`,
          `Mock with duplicated id "${mock.id}" detected. It has been ignored`
        );
        return null;
      }

      ids.push(mock.id);
      return mock;
    })
  );
  if (errorsProcessing > 0) {
    addAlert("process:mocks", `Critical errors found while loading mocks: ${errorsProcessing}`);
  }
  return mocks;
}

module.exports = {
  getMockRoutesVariants,
  getVariantId,
  getPlainMocks,
  getPlainRoutes,
  getPlainRoutesVariants,
  addCustomVariant,
  getRouteHandlerDelay,
  getVariantHandler,
  getRouteVariants,
  hasDelayProperty,
  getMock,
  getMocks,
};
