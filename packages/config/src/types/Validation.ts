import type { DefinedError } from "ajv"

import type { NamespaceInterface } from "./Config";


/** Validation result */
export interface SchemaValidationResult {
  /** Determines whether the provided config is valid or not */
  valid: boolean,
  /** Validation errors */
  errors?: DefinedError[]
}

export interface GetValidationSchemaOptions {
  namespaces: NamespaceInterface[],
  allowAdditionalProperties: boolean
}