import type { DefinedError } from "ajv"

export interface SchemaValidationResult {
  valid: boolean,
  errors?: DefinedError[]
}
