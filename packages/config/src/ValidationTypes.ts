import type { DefinedError } from "ajv";

import type { NamespaceInterface } from "./ConfigTypes";

/** Validation result */
export interface ConfigValidationResult {
  /** Determines whether the provided config is valid or not */
  valid: boolean;
  /** Validation errors */
  errors?: DefinedError[];
}

export interface GetValidationSchemaOptions {
  namespaces: NamespaceInterface[];
  allowAdditionalProperties: boolean;
}
