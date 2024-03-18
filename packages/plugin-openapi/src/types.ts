/* eslint-disable @typescript-eslint/no-empty-interface */

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID } from "./constants";

import type { OpenAPIV3 as OriginalOpenApiV3 } from "openapi-types";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & object;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OpenAPIV3 {
  export interface ResponseObject extends OriginalOpenApiV3.ResponseObject { [MOCKS_SERVER_VARIANT_ID]?: string }
  export interface ExampleObject extends OriginalOpenApiV3.ExampleObject { [MOCKS_SERVER_VARIANT_ID]?: string }

  
  export interface ResponsesObject extends OriginalOpenApiV3.ResponsesObject {}
  export interface MediaTypeObject extends OriginalOpenApiV3.MediaTypeObject {}
  export interface PathItemObject extends OriginalOpenApiV3.PathItemObject {}

  export type ResponseHeaders = ResponseObject["headers"]


  export type DereferencedSchemaObject = Prettify<Omit<OriginalOpenApiV3.SchemaObject, 'additionalProperties' | 'properties' | 'allOf' | 'oneOf' | 'anyOf' | 'not'> & {
    additionalProperties?: boolean | DereferencedSchemaObject; 
    properties?: {
      [name: string]: DereferencedSchemaObject;
    };
    allOf?: ( DereferencedSchemaObject)[];
    oneOf?: ( DereferencedSchemaObject)[];
    anyOf?: ( DereferencedSchemaObject)[];
    not?:  DereferencedSchemaObject;
  }>

  export type ArraySchemaObject = { type: 'array', items: DereferencedSchemaObject };

  export type NonArraySchemaObject = OriginalOpenApiV3.NonArraySchemaObject;

  export type NonArrayDereferencedSchemaObject = Prettify<Omit<DereferencedSchemaObject, 'type'> & {
      type?: OriginalOpenApiV3.NonArraySchemaObjectType;
  }>

  export interface OperationObject extends OriginalOpenApiV3.OperationObject { [MOCKS_SERVER_ROUTE_ID]?: string }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export type Document = OriginalOpenApiV3.Document<{
    [MOCKS_SERVER_VARIANT_ID]?: string
    [MOCKS_SERVER_ROUTE_ID]?: string
  }>
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OpenApiDefinition {
  export interface Options { 
    defaultLocation?: string,
    // Add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alerts?: any,
    // Add alerts type when exported by core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: any
  }

  export interface Collection {
    id: string,
    from?: string,
  }

  export interface Refs {
    location?: string,
    subDocPath?: string,
  }

  export interface Definition {
    basePath: string,
    refs?: Refs,
    collection?: Collection,
    document: OpenAPIV3.Document
  }
}
