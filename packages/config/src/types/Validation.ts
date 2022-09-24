import type { DefinedError } from "ajv"

import type { NamespaceInterface } from "./Config";

export interface SchemaValidationResult {
  valid: boolean,
  errors?: DefinedError[]
}

export interface GetValidationSchemaOptions {
  namespaces: NamespaceInterface[],
  allowAdditionalProperties: boolean
}