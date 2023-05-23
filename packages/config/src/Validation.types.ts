import type { DefinedError } from "ajv";

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
}
