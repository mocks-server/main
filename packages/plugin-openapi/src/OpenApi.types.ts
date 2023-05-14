import type { OpenAPIV3 as OriginalOpenApiV3 } from "openapi-types";

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID } from "./Constants";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MocksServerOpenAPIV3 {
  export interface ResponseObject extends OriginalOpenApiV3.ResponseObject {
    [MOCKS_SERVER_VARIANT_ID]?: string;
  }
  export interface ExampleObject extends OriginalOpenApiV3.ExampleObject {
    [MOCKS_SERVER_VARIANT_ID]?: string;
  }

  export type ResponsesObject = OriginalOpenApiV3.ResponsesObject;
  export type MediaTypeObject = OriginalOpenApiV3.MediaTypeObject;
  export type PathItemObject = OriginalOpenApiV3.PathItemObject;

  export type ResponseHeaders = ResponseObject["headers"];

  export interface OperationObject extends OriginalOpenApiV3.OperationObject {
    [MOCKS_SERVER_ROUTE_ID]?: string;
  }

  export type Document = OriginalOpenApiV3.Document<{
    [MOCKS_SERVER_VARIANT_ID]?: string;
    [MOCKS_SERVER_ROUTE_ID]?: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OpenApiDefinition {
  export interface Options {
    defaultLocation?: string;
    // Add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alerts?: any;
    // Add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: any;
  }

  export interface Collection {
    id: string;
    from?: string;
  }

  export interface Refs {
    location?: string;
    subDocPath?: string;
  }

  export interface Definition {
    basePath: string;
    refs?: Refs;
    collection?: Collection;
    document: MocksServerOpenAPIV3.Document;
  }
}
