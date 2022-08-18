import type { OpenAPIV3 } from "openapi-types";

export interface OpenApiMockDocument {
  basePath: string,
  document: OpenAPIV3.Document
}

export type OpenApiMockDocuments = OpenApiMockDocument[]
