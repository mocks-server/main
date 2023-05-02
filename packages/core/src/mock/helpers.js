/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { compact, isUndefined } = require("lodash");

const { getPreview } = require("../variant-handlers/helpers");
const { Collection } = require("./collections/Collection");
const {
  collectionValidationErrors,
  findRouteVariantByVariantId,
  collectionRouteVariantsValidationErrors,
  getCollectionRouteVariantsProperty,
  ALL_HTTP_METHODS_ALIAS,
  ALL_HTTP_METHODS,
  HTTP_METHODS,
} = require("./validations");

function findEqualRouteVariant(routeVariants, routeVariantToFind) {
  return routeVariants.find((routeVariant) => {
    return routeVariant.routeId === routeVariantToFind.routeId;
  });
}

function addCollectionRouteVariants(collectionRouteVariants, routeVariantsToAdd) {
  const replacedCollectionRouteVariants = collectionRouteVariants.reduce(
    (result, collectionRouteVariant) => {
      const routesVariantToReplace = findEqualRouteVariant(
        routeVariantsToAdd,
        collectionRouteVariant
      );
      result.push(routesVariantToReplace || collectionRouteVariant);
      return result;
    },
    []
  );

  routeVariantsToAdd.forEach((routeVariantToAdd) => {
    const hasBeenReplaced = !!findEqualRouteVariant(
      replacedCollectionRouteVariants,
      routeVariantToAdd
    );
    if (!hasBeenReplaced) {
      replacedCollectionRouteVariants.push(routeVariantToAdd);
    }
  });
  return replacedCollectionRouteVariants;
}

function getCollectionRouteVariants(
  collection,
  collections,
  routeVariants,
  alerts,
  alertsCollections,
  routeVariantsToAdd = []
) {
  const collectionRouteVariants = compact(
    getCollectionRouteVariantsProperty(collection).map((variantId) => {
      return findRouteVariantByVariantId(routeVariants, variantId);
    })
  );
  if (collection.from) {
    const from = collections.find(
      (collectionCandidate) => collectionCandidate.id === collection.from
    );
    if (from) {
      return getCollectionRouteVariants(
        from,
        collections,
        routeVariants,
        alerts,
        alertsCollections,
        addCollectionRouteVariants(collectionRouteVariants, routeVariantsToAdd)
      );
    }
    // TODO, throw an error in strict validation mode
    alerts.set(
      "from",
      `Collection with invalid 'from' property detected, '${collection.from}' was not found`
    );
  }
  return addCollectionRouteVariants(collectionRouteVariants, routeVariantsToAdd);
}

function getVariantId(routeId, variantId) {
  if (routeId && variantId) {
    return `${routeId}:${variantId}`;
  }
  return null;
}

function getPlainCollections(collections, collectionsDefinitions) {
  return collections.map((collection) => {
    const collectionDefinition = collectionsDefinitions.find(
      (collectionCandidate) => collectionCandidate.id === collection.id
    );
    return {
      id: collection.id,
      from: (collectionDefinition && collectionDefinition.from) || null,
      definedRoutes:
        (collectionDefinition && getCollectionRouteVariantsProperty(collectionDefinition)) || [],
      routes: collection.routeVariants.map((routeVariant) => routeVariant.id),
    };
  });
}

function getRoutePlainRouteVariants(route, routeVariants) {
  if (!route.variants || !Array.isArray(route.variants)) {
    return [];
  }
  return compact(
    route.variants.map((variant) => {
      if (!variant) {
        return null;
      }
      const variantId = getVariantId(route.id, variant.id);
      const variantHandler = routeVariants.find((routeVariant) => routeVariant.id === variantId);
      if (variantHandler) {
        return variantId;
      }
    })
  );
}

function parseRouteMethod(method) {
  return HTTP_METHODS[method.toUpperCase()];
}

function parseRouteMethods(method) {
  if (!method || method === ALL_HTTP_METHODS_ALIAS) {
    return ALL_HTTP_METHODS;
  }
  return Array.isArray(method) ? method.map(parseRouteMethod) : parseRouteMethod(method);
}

function getPlainRoutes(routes, routeVariants) {
  let ids = [];

  return compact(
    routes.map((route) => {
      if (
        !route ||
        !route.id ||
        ids.includes(route.id) ||
        !routeVariants.find((routeVariant) => routeVariant.routeId === route.id)
      ) {
        return null;
      }
      ids.push(route.id);
      return {
        id: route.id,
        url: route.url,
        method: parseRouteMethods(route.method),
        delay: isUndefined(route.delay) ? null : route.delay,
        variants: getRoutePlainRouteVariants(route, routeVariants),
      };
    })
  );
}

function getPlainRouteVariants(routeVariants) {
  return routeVariants.map((routeVariant) => {
    const preview = getPreview(routeVariant);
    return {
      id: routeVariant.id,
      disabled: routeVariant.disabled,
      route: routeVariant.routeId,
      type: routeVariant.type,
      preview: isUndefined(preview) ? null : preview,
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

function getCollection({
  collectionDefinition,
  collectionsDefinitions,
  routeVariants,
  logger,
  loggerRoutes,
  getGlobalDelay,
  alerts,
  alertsCollections,
}) {
  let collection = null;

  const collectionRouteVariantsErrors = collectionRouteVariantsValidationErrors(
    collectionDefinition,
    routeVariants
  );
  if (!!collectionRouteVariantsErrors) {
    alerts.set("variants", collectionRouteVariantsErrors.message);
    logger.silly(
      `Collection route variants validation errors: ${JSON.stringify(
        collectionRouteVariantsErrors.errors
      )}`
    );
    // TODO, add strict validation mode
    // return null;
  }

  const collectionErrors = collectionValidationErrors(collectionDefinition, routeVariants);
  if (!!collectionErrors) {
    alerts.set("validation", collectionErrors.message);
    logger.silly(`Collection validation errors: ${JSON.stringify(collectionErrors.errors)}`);
    return null;
  }

  try {
    collection = new Collection({
      id: collectionDefinition.id,
      routeVariants: getCollectionRouteVariants(
        collectionDefinition,
        collectionsDefinitions,
        routeVariants,
        alerts,
        alertsCollections
      ),
      logger: loggerRoutes,
      getDelay: getGlobalDelay,
    });
  } catch (error) {
    alerts.set("process", "Error processing collection", error);
  }
  return collection;
}

function getCollections({
  collectionsDefinitions,
  alerts,
  logger,
  loggerRoutes,
  routeVariants,
  getGlobalDelay,
}) {
  alerts.clean();
  let errorsProcessing = 0;
  let ids = [];
  const collections = compact(
    collectionsDefinitions.map((collectionDefinition, index) => {
      const collectionDefinitionId = collectionDefinition && collectionDefinition.id;
      const alertsCollectionId =
        !collectionDefinitionId || ids.includes(collectionDefinitionId)
          ? index
          : collectionDefinitionId;
      const alertsCollection = alerts.collection(alertsCollectionId);
      const collection = getCollection({
        collectionDefinition,
        collectionsDefinitions,
        routeVariants,
        getGlobalDelay,
        logger,
        loggerRoutes,
        alerts: alertsCollection,
        alertsCollections: alerts,
      });
      if (!collection) {
        errorsProcessing++;
        return null;
      }
      if (ids.includes(collection.id)) {
        alertsCollection.set(
          "duplicated",
          `Collection with duplicated id '${collection.id}' detected. It has been ignored`
        );
        return null;
      }

      ids.push(collection.id);
      return collection;
    })
  );
  if (errorsProcessing > 0) {
    alerts.set(
      "critical-error",
      `Critical errors found while loading collections: ${errorsProcessing}`
    );
  }
  return collections;
}

module.exports = {
  getCollectionRouteVariants,
  getPlainCollections,
  getPlainRoutes,
  getPlainRouteVariants,
  addCustomVariant,
  getCollection,
  getCollections,
  getVariantId,
};
