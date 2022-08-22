import type { OpenAPIV3 } from "openapi-types";

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID } from "./constants";

export interface RefsOptions {
  location?: string,
  subDocPath?: string,
}

export interface OpenApiMockDocument {
  basePath: string,
  refs: RefsOptions,
  document: OpenAPIV3.Document
}

export type OpenApiMockDocuments = OpenApiMockDocument[]

export type ResponseObjectWithVariantId = OpenAPIV3.ResponseObject & { [MOCKS_SERVER_VARIANT_ID]?: string }
export type ExampleObjectWithVariantId = OpenAPIV3.ExampleObject & { [MOCKS_SERVER_VARIANT_ID]?: string }
export type ResponseHeaders = OpenAPIV3.ResponseObject["headers"]

export type OperationObjectWithRouteId = OpenAPIV3.OperationObject<{[MOCKS_SERVER_ROUTE_ID]?: string}>

export interface OpenApiToRoutesAdvancedOptions { 
  defaultLocation?: string,
  // TODO, add alerts type when exported by core
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alerts?: any,
  // TODO, add alerts type when exported by core
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: any
}
