/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ValidateFunction, ErrorObject } from "ajv";

import { objectKeys, arrayLowerAndUpper } from "../../common";
import type { HTTPMethod } from "../../server/types";
import { getOptionsFromVariant } from "../../variant-handlers";
import type { VariantHandlerConstructor, VariantHandlerId } from "../../variant-handlers/types";
import type { RouteDefinition } from "../definitions/types";
import { validator, withIdMessage, validationSingleMessage, ajvErrorLike } from "../Validator";
import type {
  JSONSchema7WithInstanceofDefinition,
  JSONSchema7WithInstanceof,
  ValidationErrors,
} from "../Validator.types";

import type { HttpMethods } from "./RoutesValidator.types";

export const HTTP_METHODS: HttpMethods = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  DELETE: "delete",
  PUT: "put",
  OPTIONS: "options",
  HEAD: "head",
  TRACE: "trace",
};

let routeValidator: ValidateFunction, routeSchema: JSONSchema7WithInstanceofDefinition;

export const validHttpMethods = objectKeys(HTTP_METHODS);

export const ALL_HTTP_METHODS = validHttpMethods.map((methodKey): HTTPMethod => {
  return HTTP_METHODS[methodKey];
});

export const ALL_HTTP_METHODS_ALIAS = "*";

const validHttpMethodsLowerAndUpper = arrayLowerAndUpper(validHttpMethods);

const routesSchema: JSONSchema7WithInstanceofDefinition = {
  type: "object",
  properties: {
    id: {
      type: "string",
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
    },
    method: {
      oneOf: [
        {
          type: "string",
          enum: [...validHttpMethodsLowerAndUpper, ALL_HTTP_METHODS_ALIAS],
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
    },
    delay: {
      type: "integer",
      minimum: 0,
    },
    variants: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              disabled: {
                enum: [false],
              },
              type: {
                type: "string",
                enum: [], // this enum is defined when validator is compiled
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
              },
              options: {
                type: "object",
              },
            },
            required: ["id", "type"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              disabled: {
                enum: [true],
              },
            },
            required: ["id"],
            additionalProperties: false,
          },
        ],
      },
    },
  },
  required: ["id", "url", "variants"],
  additionalProperties: false,
};

function getVariantHandlersIds(variantHandlers: VariantHandlerConstructor[]): VariantHandlerId[] {
  return variantHandlers.map((variantHandler) => variantHandler.id);
}

export function compileValidator(variantHandlers: VariantHandlerConstructor[]) {
  const supportedRouteHandlersIds = getVariantHandlersIds(variantHandlers);
  const schema: JSONSchema7WithInstanceofDefinition = {
    ...(routesSchema as object),
  };
  const allowedTypesProperty = (
    ((schema.properties?.variants as JSONSchema7WithInstanceof).items as JSONSchema7WithInstanceof)
      .oneOf as JSONSchema7WithInstanceof[]
  )[0].properties?.type as JSONSchema7WithInstanceof;

  allowedTypesProperty.enum = supportedRouteHandlersIds;

  routeSchema = { ...schema };
  routeValidator = validator.compile(schema);
}

function routeValidationMessage(data: object, errors: ErrorObject[]) {
  return validationSingleMessage(routeSchema, data, errors);
}

export function routeValidationErrors(route: RouteDefinition): ValidationErrors | null {
  const isValid = routeValidator({ ...route });
  if (!isValid) {
    const errors = routeValidator.errors as ErrorObject[];
    const idTrace = route && route.id ? `${withIdMessage(route.id)} ` : "";
    return {
      message: `Route ${idTrace}is invalid: ${routeValidationMessage(route, errors)}`,
      errors,
    };
  }
  return null;
}

export function variantValidationErrors(
  route: RouteDefinition,
  variant: MocksServer.VariantDefinition,
  Handler?: VariantHandlerConstructor
): ValidationErrors | null {
  const variantId = variant.id || "";
  if (!variant.disabled && !variant.type) {
    const error = "'type' property is required or 'disabled' property should be true";
    return {
      message: `Variant ${withIdMessage(variantId)} in route ${withIdMessage(
        route.id
      )} is invalid: ${error}`,
      errors: [ajvErrorLike(error)],
    };
  }
  if (Handler && !Handler.validationSchema) {
    return null;
  }
  const HandlerToValidate = Handler as VariantHandlerConstructor;
  const variantValidator = validator.compile(HandlerToValidate.validationSchema);
  const dataToCheck = getOptionsFromVariant({ ...variant });
  const dataMessage = "Invalid 'options' property:";
  const isValid = variantValidator(dataToCheck);
  if (!isValid) {
    const errors = variantValidator.errors as ErrorObject[];
    let validationMessage;
    try {
      validationMessage = validationSingleMessage(
        HandlerToValidate.validationSchema,
        dataToCheck || {},
        errors
      );
    } catch (error) {
      validationMessage = " Wrong type";
    }
    const idTrace = variant && variant.id ? `${withIdMessage(variant.id)} ` : "";
    return {
      message: `Variant ${idTrace}in route ${withIdMessage(
        route.id
      )} is invalid: ${dataMessage}${validationMessage}`,
      errors: variantValidator.errors,
    };
  }
  return null;
}
