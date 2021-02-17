/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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

module.exports = {
  getMockRoutesVariants,
  getVariantId,
  getPlainMocks,
  getPlainRoutes,
  getPlainRoutesVariants,
  addCustomVariant,
  getIds,
  getRouteHandlerDelay,
};
