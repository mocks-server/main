/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { compact, isUndefined } = require("lodash");

const { getPreview } = require("../variant-handlers/helpers");
const {
  getCollectionRouteVariantsProperty,
  ALL_HTTP_METHODS_ALIAS,
  ALL_HTTP_METHODS,
  HTTP_METHODS,
} = require("./validations");

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
      routes: collection.routes.map((routeVariant) => routeVariant.id),
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

function getPlainRoutes(routeDefinitions, routes) {
  let ids = [];

  return compact(
    routeDefinitions.map((routeDefinition) => {
      if (
        !routeDefinition ||
        !routeDefinition.id ||
        ids.includes(routeDefinition.id) ||
        !routes.find((route) => route.routeId === routeDefinition.id)
      ) {
        return null;
      }
      ids.push(routeDefinition.id);
      return {
        id: routeDefinition.id,
        url: routeDefinition.url,
        method: parseRouteMethods(routeDefinition.method),
        delay: isUndefined(routeDefinition.delay) ? null : routeDefinition.delay,
        variants: getRoutePlainRouteVariants(routeDefinition, routes),
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

module.exports = {
  getPlainCollections,
  getPlainRoutes,
  getPlainRouteVariants,
};
