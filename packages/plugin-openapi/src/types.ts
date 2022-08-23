/* eslint-disable @typescript-eslint/no-empty-interface */

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID } from "./constants";

import type { OpenAPIV3 as OriginalOpenApiV3 } from "openapi-types";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OpenAPIV3 {
  export interface ResponseObject extends OriginalOpenApiV3.ResponseObject { [MOCKS_SERVER_VARIANT_ID]?: string }
  export interface ExampleObject extends OriginalOpenApiV3.ExampleObject { [MOCKS_SERVER_VARIANT_ID]?: string }

  
  export interface ResponsesObject extends OriginalOpenApiV3.ResponsesObject {}
  export interface MediaTypeObject extends OriginalOpenApiV3.MediaTypeObject {}
  export interface PathItemObject extends OriginalOpenApiV3.PathItemObject {}

  export type ResponseHeaders = ResponseObject["headers"]

  export interface OperationObject extends OriginalOpenApiV3.OperationObject { [MOCKS_SERVER_ROUTE_ID]?: string }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export type Document = OriginalOpenApiV3.Document<{
    [MOCKS_SERVER_VARIANT_ID]?: string
    [MOCKS_SERVER_ROUTE_ID]?: string
  }>
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OpenApiRoutes {
  export interface Options { 
    defaultLocation?: string,
    // TODO, add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alerts?: any,
    // TODO, add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: any
  }

  export interface RefsOptions {
    location?: string,
    subDocPath?: string,
  }

  export interface Document {
    basePath: string,
    refs?: RefsOptions,
    document: OpenAPIV3.Document
  }
}
