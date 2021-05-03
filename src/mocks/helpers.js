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

function getMockRoutesVariants(mock, mocks, routesVariants, routesVariantsToAdd = []) {
  const mockRoutesVariants = compact(
    mock.routesVariants.map((routeId) => {
      // TODO, add alert if not found
      return routesVariants.find((routeVariant) => routeVariant.variantId === routeId);
    })
  );
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
  return compact(
    routes.map((route) => {
      if (!route || !routesVariants.find((routeVariant) => routeVariant.routeId === route.id)) {
        return null;
      }
      return {
        id: route.id,
        url: route.url,
        method: route.method,
        delay: route.delay || null,
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
  removeAlerts("validation:route");
  removeAlerts("process:route");
  return compact(
    flatten(
      routesDefinitions.map((route, index) => {
        const routeErrors = routeValidationErrors(route);
        const alertScope = `validation:route:${index}`;
        const processAlertScope = `process:route:${index}`;
        if (!!routeErrors) {
          addAlert(alertScope, routeErrors.message);
          tracer.silly(`Route validation errors: ${JSON.stringify(routeErrors.errors)}`);
          return null;
        }
        return route.variants.map((variant, index) => {
          return getVariantHandler({
            route,
            variant,
            variantIndex: index,
            routeHandlers,
            core,
            addAlert,
            removeAlerts,
            alertScope,
            processAlertScope,
          });
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
  const mockErrors = mockValidationErrors(mockDefinition);
  const alertScope = `validation:mock:${mockIndex}`;
  const processAlertScope = `process:mock:${mockIndex}`;
  removeAlerts(alertScope);
  removeAlerts(processAlertScope);
  if (!!mockErrors) {
    addAlert(alertScope, mockErrors.message);
    tracer.silly(`Mock validation errors: ${JSON.stringify(mockErrors.errors)}`);
    return null;
  }
  try {
    mock = new Mock({
      id: mockDefinition.id,
      routesVariants: getMockRoutesVariants(mockDefinition, mocksDefinitions, routeVariants),
      getDelay: getGlobalDelay,
    });
  } catch (error) {
    addAlert(processAlertScope, error.message);
    tracer.error(`Error processing mock: ${error.message}`);
  }
  return mock;
}

function getMocks({ mocksDefinitions, addAlert, removeAlerts, routeVariants, getGlobalDelay }) {
  let errorsProcessing = 0;
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
      }
      return mock;
    })
  );
  if (errorsProcessing > 0) {
    addAlert("process:mocks", `${errorsProcessing} errors found while loading mocks`);
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
