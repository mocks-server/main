/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { flatten, compact } = require("lodash");

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

function getMockRoutesVariants(mock, mocks, routesVariants, alerts, routesVariantsToAdd = []) {
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
        alerts,
        addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd)
      );
    }
    // TODO, throw an error in strict validation mode
    alerts.set("from", `Mock with invalid 'from' property detected, '${mock.from}' was not found`);
  }
  return addMockRoutesVariants(mockRoutesVariants, routesVariantsToAdd);
}

function getVariantId(routeId, variantId) {
  if (routeId && variantId) {
    return `${routeId}:${variantId}`;
  }
  return null;
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
    // TODO, use better method, store base id and variant id in an object to avoid conflicts with possible routes ids containing ":"
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

function getVariantHandler({ route, variant, variantIndex, routeHandlers, core, logger, alerts }) {
  let routeHandler = null;
  const variantId = getVariantId(route.id, variant.id);
  const handlerId = variant.handler || DEFAULT_ROUTES_HANDLER;
  const Handler = findRouteHandler(routeHandlers, handlerId);
  const variantErrors = variantValidationErrors(route, variant, Handler);
  const variantAlerts = alerts.collection(variant.id || variantIndex);
  variantAlerts.clean();

  if (!!variantErrors) {
    variantAlerts.set("validation", variantErrors.message);
    logger.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
    return null;
  }

  try {
    routeHandler = new Handler(
      {
        ...variant,
        variantId,
        url: route.url,
        method: route.method,
      },
      // TODO, pass a custom core
      core,
      {
        logger, // Do not document this parameter, because it will be removed in next minor version
      }
    );
    routeHandler.delay = getRouteHandlerDelay(variant, route);
    routeHandler.id = variant.id;
    routeHandler.variantId = variantId;
    routeHandler.routeId = route.id;
    routeHandler.url = route.url;
    routeHandler.method = route.method;
  } catch (error) {
    variantAlerts.set("process", error.message, error);
  }

  return routeHandler;
}

function getRouteVariants({ routesDefinitions, alerts, logger, routeHandlers, core }) {
  let routeIds = [];
  alerts.clean();
  return compact(
    flatten(
      routesDefinitions.map((route, index) => {
        let routeVariantsIds = [];
        const routeAlerts = alerts.collection(route.id || index);
        const routeErrors = routeValidationErrors(route);
        if (!!routeErrors) {
          routeAlerts.set("validation", routeErrors.message);
          logger.silly(`Route validation errors: ${JSON.stringify(routeErrors.errors)}`);
          return null;
        }
        if (routeIds.includes(route.id)) {
          routeAlerts.set(
            "duplicated",
            `Route with duplicated id '${route.id}' detected. It has been ignored`
          );
          return null;
        }
        routeIds.push(route.id);
        const variantsAlerts = routeAlerts.collection("variants");
        return route.variants.map((variant, variantIndex) => {
          const variantHandler = getVariantHandler({
            route,
            variant,
            variantIndex,
            routeHandlers,
            core,
            logger,
            alerts: variantsAlerts,
          });
          if (variantHandler) {
            if (routeVariantsIds.includes(variantHandler.id)) {
              variantsAlerts
                .collection(variantHandler.id)
                .set(
                  "duplicated",
                  `Route variant with duplicated id '${variantHandler.id}' detected in route '${route.id}'. It has been ignored`
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
  mocksDefinitions,
  routeVariants,
  logger,
  getGlobalDelay,
  alerts,
}) {
  let mock = null;

  const mockRouteVariantsErrors = mockRouteVariantsValidationErrors(mockDefinition, routeVariants);
  if (!!mockRouteVariantsErrors) {
    alerts.set("variants", mockRouteVariantsErrors.message);
    logger.silly(
      `Mock variants validation errors: ${JSON.stringify(mockRouteVariantsErrors.errors)}`
    );
    // TODO, add strict validation mode
    // return null;
  }

  const mockErrors = mockValidationErrors(mockDefinition, routeVariants);
  if (!!mockErrors) {
    alerts.set("validation", mockErrors.message);
    logger.silly(`Mock validation errors: ${JSON.stringify(mockErrors.errors)}`);
    return null;
  }

  try {
    mock = new Mock({
      id: mockDefinition.id,
      routesVariants: getMockRoutesVariants(
        mockDefinition,
        mocksDefinitions,
        routeVariants,
        alerts
      ),
      logger,
      getDelay: getGlobalDelay,
    });
  } catch (error) {
    alerts.set("process", "Error processing mock", error);
  }
  return mock;
}

function getMocks({ mocksDefinitions, alerts, logger, routeVariants, getGlobalDelay }) {
  alerts.clean();
  let errorsProcessing = 0;
  let ids = [];
  const mocks = compact(
    mocksDefinitions.map((mockDefinition, index) => {
      const mockDefinitionId = mockDefinition && mockDefinition.id;
      const alertsCollectionId =
        !mockDefinitionId || ids.includes(mockDefinitionId) ? index : mockDefinitionId;
      const alertsMock = alerts.collection(alertsCollectionId);
      const mock = getMock({
        mockDefinition,
        mocksDefinitions,
        routeVariants,
        getGlobalDelay,
        logger,
        alerts: alertsMock,
      });
      if (!mock) {
        errorsProcessing++;
        return null;
      }
      if (ids.includes(mock.id)) {
        alertsMock.set(
          "duplicated",
          `Mock with duplicated id '${mock.id}' detected. It has been ignored`
        );
        return null;
      }

      ids.push(mock.id);
      return mock;
    })
  );
  if (errorsProcessing > 0) {
    alerts.set("critical-error", `Critical errors found while loading mocks: ${errorsProcessing}`);
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
