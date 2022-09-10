/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { flatten, compact, isUndefined } = require("lodash");

const { getDataFromVariant, getPreview } = require("../variant-handlers/helpers");
const CoreApi = require("../common/CoreApi");
const Collection = require("./Collection");
const {
  variantValidationErrors,
  routeValidationErrors,
  collectionValidationErrors,
  findRouteVariantByVariantId,
  collectionRouteVariantsValidationErrors,
  getCollectionRouteVariantsProperty,
  variantDisabledValidationErrors,
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
      routes: collection.routeVariants.map((routeVariant) => routeVariant.variantId),
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
      const variantHandler = routeVariants.find(
        (routeVariant) => routeVariant.variantId === variantId
      );
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
        delay: hasDelayProperty(route) ? route.delay : null,
        variants: getRoutePlainRouteVariants(route, routeVariants),
      };
    })
  );
}

function getPlainRouteVariants(routeVariants) {
  return routeVariants.map((routeVariant) => {
    const preview = getPreview(routeVariant);
    return {
      id: routeVariant.variantId,
      disabled: routeVariant.disabled,
      route: routeVariant.routeId,
      type: routeVariant.constructor.id,
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

function getHandlerId(variant) {
  return variant.type;
}

function getDisabledVariantHandler({ logger, route, variant, variantIndex, alerts }) {
  const variantId = getVariantId(route.id, variant.id);
  const variantAlerts = alerts.collection(variant.id || variantIndex);
  const variantErrors = variantDisabledValidationErrors(route, variant);

  variantAlerts.clean();

  if (!!variantErrors) {
    variantAlerts.set("validation", variantErrors.message);
    logger.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
    return null;
  }

  return {
    disabled: variant.disabled,
    id: variant.id,
    variantId: variantId,
    routeId: route.id,
    url: route.url,
    method: route.method,
  };
}

function getVariantHandler({
  route,
  variant,
  variantIndex,
  routeHandlers,
  core,
  logger,
  loggerRoutes,
  alerts,
  alertsRoutes,
}) {
  if (variant.disabled) {
    return getDisabledVariantHandler({
      logger,
      route,
      variant,
      variantIndex,
      alerts,
    });
  }
  let routeHandler = null;
  const variantId = getVariantId(route.id, variant.id);
  const variantAlerts = alerts.collection(variant.id || variantIndex);
  const handlerId = getHandlerId(variant);
  const Handler = findRouteHandler(routeHandlers, handlerId);
  const variantErrors = variantValidationErrors(route, variant, Handler);

  const variantNamespace = variantId || getVariantId(route.id, variantIndex);
  const routeVariantLogger = loggerRoutes.namespace(variantNamespace);
  loggerRoutes.debug(`Creating logger namespace for route variant ${variantNamespace}`);
  const routeVariantAlerts = alertsRoutes.collection(variantNamespace);
  const routeVariantCoreApi = new CoreApi({
    core,
    logger: routeVariantLogger,
    alerts: routeVariantAlerts,
  });

  variantAlerts.clean();

  if (!!variantErrors) {
    variantAlerts.set("validation", variantErrors.message);
    logger.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
    return null;
  }

  try {
    const variantArgument = getDataFromVariant(variant);
    routeHandler = new Handler(
      {
        ...variantArgument,
        url: route.url,
        method: route.method,
      },
      routeVariantCoreApi
    );
    // TODO, do not add properties to handler. Store it in "handler" property
    routeHandler.delay = getRouteHandlerDelay(variant, route);
    routeHandler.id = variant.id;
    routeHandler.disabled = false;
    routeHandler.variantId = variantId;
    routeHandler.routeId = route.id;
    routeHandler.url = route.url;
    routeHandler.method = route.method;
    routeHandler.logger = routeVariantLogger;
  } catch (error) {
    variantAlerts.set("process", error.message, error);
  }

  return routeHandler;
}

function getRouteVariants({
  routesDefinitions,
  alerts,
  alertsRoutes,
  logger,
  loggerRoutes,
  routeHandlers,
  core,
}) {
  let routeIds = [];
  alerts.clean();

  return compact(
    flatten(
      routesDefinitions.map((route, index) => {
        let routeVariantsIds = [];
        const routeAlerts = alerts.collection((route && route.id) || index);
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
            alertsRoutes,
            loggerRoutes,
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
  getVariantId,
  getPlainCollections,
  getPlainRoutes,
  getPlainRouteVariants,
  addCustomVariant,
  getRouteHandlerDelay,
  getVariantHandler,
  getRouteVariants,
  hasDelayProperty,
  getCollection,
  getCollections,
};
