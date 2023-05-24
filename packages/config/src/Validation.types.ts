import type { DefinedError } from "ajv";
import type { JSONSchema7 } from "json-schema";

import type { ConfigNamespaceInterface } from "./Config.types";

/** Validation result */
export interface ConfigValidationResult {
  /** Determines whether the provided config is valid or not */
  valid: boolean;
  /** Validation errors */
  errors?: DefinedError[];
}

export interface GetValidationSchemaOptions {
  namespaces: ConfigNamespaceInterface[];
  allowAdditionalProperties: boolean;
  // Remove custom AJV keywords from schema
  removeCustomProperties?: boolean;
}

export type JSONSchema7WithUnknownDefinition = JSONSchema7WithUnknown | boolean;
export interface JSONSchema7WithUnknown extends JSONSchema7 {
  isUnknown?: boolean;
  $defs?:
    | {
        [key: string]: JSONSchema7WithUnknownDefinition;
      }
    | undefined;

  items?: JSONSchema7WithUnknownDefinition | JSONSchema7WithUnknownDefinition[];
  additionalItems?: JSONSchema7WithUnknownDefinition;
  contains?: JSONSchema7WithUnknown;
  properties?: {
    [key: string]: JSONSchema7WithUnknownDefinition;
  };
  patternProperties?: {
    [key: string]: JSONSchema7WithUnknownDefinition;
  };
  additionalProperties?: JSONSchema7WithUnknownDefinition | undefined;
  dependencies?: {
    [key: string]: JSONSchema7WithUnknownDefinition | string[];
  };
  propertyNames?: JSONSchema7WithUnknownDefinition;

  if?: JSONSchema7WithUnknownDefinition;
  then?: JSONSchema7WithUnknownDefinition;
  else?: JSONSchema7WithUnknownDefinition;

  allOf?: JSONSchema7WithUnknownDefinition[];
  anyOf?: JSONSchema7WithUnknownDefinition[];
  oneOf?: JSONSchema7WithUnknownDefinition[];
  not?: JSONSchema7WithUnknownDefinition;
}
