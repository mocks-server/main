import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import betterAjvErrors from "better-ajv-errors";

import type { AllowedInstancesOf, JSONSchema7WithInstanceofDefinition } from "./Validator.types";

const ajv = new Ajv({ allErrors: true });

const ALLOWED_INSTANCES: AllowedInstancesOf = { Function: Function, RegExp: RegExp };

export function withIdMessage(id: string): string {
  return `with id '${id}'`;
}

export function validationSingleMessage(
  schema: JSONSchema7WithInstanceofDefinition,
  data?: object,
  errors?: ErrorObject[]
): string {
  const formattedJson = betterAjvErrors(schema, data || {}, errors || [], {
    format: "js",
  });
  return formattedJson.map((result) => result.error).join(". ");
}

export function ajvErrorLike(message: string): ErrorObject {
  return {
    message,
    keyword: "",
    instancePath: "",
    schemaPath: "",
    params: {},
  };
}

export function customValidationSingleMessage(errors: ErrorObject[]): string {
  return errors
    .reduce((messages, error) => {
      if (error.message?.length) {
        messages.push(error.message);
      }
      return messages;
    }, [] as string[])
    .join(". ");
}

ajv.addKeyword({
  keyword: "instanceof",
  compile: (schema: keyof AllowedInstancesOf) => (data) =>
    data instanceof ALLOWED_INSTANCES[schema],
  errors: false,
});

export const validator = ajv;
