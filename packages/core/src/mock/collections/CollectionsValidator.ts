/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import type { ErrorObject } from "ajv";
import { compact } from "lodash";

import type {
  CollectionDefinition,
  RouteDefinitionId,
  VariantDefinitionId,
} from "../definitions/types";
import type { RouteId, RouteInterface } from "../routes/types";
import {
  validator,
  withIdMessage,
  validationSingleMessage,
  ajvErrorLike,
  customValidationSingleMessage,
} from "../Validator";
import type { JSONSchema7WithInstanceofDefinition, ValidationErrors } from "../Validator.types";

const collectionsSchema: JSONSchema7WithInstanceofDefinition = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    from: {
      type: ["string", "null"],
    },
    routes: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
    },
  },
  required: ["id", "routes"],
  additionalProperties: false,
};

const collectionValidator = validator.compile(collectionsSchema);

export function findRouteByVariantId(
  routes: RouteInterface[],
  variantId: VariantDefinitionId
): RouteInterface | undefined {
  return routes.find((route) => route.id === variantId);
}

export function getCollectionRouteIds(collection: CollectionDefinition): RouteId[] {
  return collection.routes || collection.routeVariants;
}

function collectionValidationMessage(data: object, errors: ErrorObject[]): string {
  return validationSingleMessage(collectionsSchema, data, errors);
}

function collectionErrorsMessagePrefix(collection: CollectionDefinition): string {
  const idTrace = collection && collection.id ? `${withIdMessage(collection.id)} ` : "";
  return `Collection ${idTrace}is invalid:`;
}

export function collectionValidationErrors(
  collection: CollectionDefinition
): ValidationErrors | null {
  const isValid = collectionValidator(collection);
  if (!isValid) {
    const errors = collectionValidator.errors as ErrorObject[];
    return {
      message: `${collectionErrorsMessagePrefix(collection)} ${collectionValidationMessage(
        collection,
        errors
      )}`,
      errors,
    };
  }
  return null;
}

function notFoundRouteError(routeId: RouteId): ErrorObject {
  return ajvErrorLike(
    `routeVariant ${withIdMessage(
      routeId
    )} was not found, use a valid 'routeId:variantId' identifier`
  );
}

function duplicatedRouteError(routeId: RouteDefinitionId): ErrorObject {
  return ajvErrorLike(
    `route ${withIdMessage(routeId)} is used more than once in the same collection`
  );
}

function collectionRouteVariantsErrors(
  routeIds: RouteId[],
  routes: RouteInterface[]
): ErrorObject[] {
  const routeDefinitionIds: RouteDefinitionId[] = [];
  return compact(
    routeIds.map((routeId) => {
      const route = findRouteByVariantId(routes, routeId);
      if (!route) {
        return notFoundRouteError(routeId);
      }
      if (routeDefinitionIds.includes(route.routeId)) {
        return duplicatedRouteError(route.routeId);
      }
      routeDefinitionIds.push(route.routeId);
      return null;
    })
  );
}

function collectionInvalidRouteVariants(
  collectionDefinition: CollectionDefinition,
  routes: RouteInterface[]
): ErrorObject[] {
  const routeIdsInCollectionDefinition =
    collectionDefinition && getCollectionRouteIds(collectionDefinition);
  const routeIds =
    routeIdsInCollectionDefinition && Array.isArray(routeIdsInCollectionDefinition)
      ? routeIdsInCollectionDefinition
      : [];
  return collectionRouteVariantsErrors(routeIds, routes);
}

export function collectionRouteVariantsValidationErrors(
  collection: CollectionDefinition,
  routes: RouteInterface[]
): ValidationErrors | null {
  const invalidRouteVariants = collectionInvalidRouteVariants(collection, routes);
  if (invalidRouteVariants.length) {
    return {
      message: `${collectionErrorsMessagePrefix(collection)} ${customValidationSingleMessage(
        invalidRouteVariants
      )}`,
      errors: invalidRouteVariants,
    };
  }
  return null;
}
