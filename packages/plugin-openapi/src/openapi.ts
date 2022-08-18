import type { OpenAPIV3 } from "openapi-types";
import type { Routes, RouteVariantType } from "@mocks-server/core";

import { OpenAPIV3 as OpenApiV3Object } from "openapi-types";

import type { OpenApiMockDocuments, OpenApiMockDocument } from "./types";

const MOCKS_SERVER_ROUTE_ID = "x-mocks-server-route-id";
const methods = Object.values(OpenApiV3Object.HttpMethods);

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function replaceTemplateInPath(path: string): string {
  // /api/users/{userId} -> api/users/:userId
  return path.replace(/{(\S*)}/gim, ":$1")
}

function pathToId(path: string): string {
  // /api/users/{userId} -> api-users-userId
  return path.replace(/^\//gim, "").replace(/\//gim, "-").replace(/[{}]/gim, "")
}

function avoidDoubleSlashes(path: string): string {
  // /api//users -> /api/users
  return path.replace(/\/+/gim,"/");
}

function routeUrl(path: string, basePath: string): string {
  if(basePath) {
    return avoidDoubleSlashes(`${basePath}/${replaceTemplateInPath(path)}`);
  }
  return replaceTemplateInPath(path);
}

function routeId(path: string, method: string, mocksServerId?: string): string {
  if(mocksServerId) {
    return mocksServerId;
  }
  return `${method}-${pathToId(path)}`;
}

function isJsonMediaType(mediaType: string): boolean {
  // TODO, make compatible with all possible media types
  return mediaType === "application/json";
}

function isTextMediaType(mediaType: string): boolean {
  // TODO, make compatible with all possible media types
  return mediaType === "text/plain" ||  mediaType === "text/html";
}

function openApiResponseBaseVariant(variantType: RouteVariantType, code: string, exampleId?: string) {
  const id = exampleId ? `${code}-${variantType}-${exampleId}` : `${code}-${variantType}` 
  return {
    id,
    type: variantType,
  };
}

// TODO, support also ReferenceObject in examples
function openApiResponseExampleToVariant(exampleId: string, code: string, openApiResponseExample: OpenAPIV3.ExampleObject, variantType: RouteVariantType) {
  if(!notEmpty(openApiResponseExample) || !notEmpty(openApiResponseExample.value)) {
    return null;
  }
  
  const baseVariant = openApiResponseBaseVariant(variantType, code, exampleId);
  return {
    ...baseVariant,
    options: {
      status: Number(code),
      body: openApiResponseExample.value
    } 
  }
}

function openApiResponseNoContentToVariant(code: string) {
  const baseVariant = openApiResponseBaseVariant("status", code);
  return {
    ...baseVariant,
    options: {
      status: Number(code),
    } 
  }
}

function openApiResponseExamplesToVariants(code: string, openApiResponseMediaType: OpenAPIV3.MediaTypeObject, variantType: RouteVariantType) {
  const examples = openApiResponseMediaType.examples;
  if(!notEmpty(examples)) {
    return null;
  }
  return Object.keys(examples).map((exampleId: string) => {
    // TODO, support also ReferenceObject in examples
    return openApiResponseExampleToVariant(exampleId, code, examples[exampleId] as OpenAPIV3.ExampleObject, variantType);
  }).filter(notEmpty);
}

function openApiResponseMediaToVariants(code: string, mediaType: string, openApiResponseMediaType?: OpenAPIV3.MediaTypeObject) {
  if(!notEmpty(openApiResponseMediaType)) {
    return null;
  }
  if(isJsonMediaType(mediaType)) {
    return openApiResponseExamplesToVariants(code, openApiResponseMediaType, "json");
  }
  if(isTextMediaType(mediaType)) {
    return openApiResponseExamplesToVariants(code, openApiResponseMediaType, "text");
  }
  return null;
}

function openApiResponseCodeToVariants(code: string, openApiResponse?: OpenAPIV3.ResponseObject) {
  if(!notEmpty(openApiResponse)) {
    return [];
  }
  const content = openApiResponse.content;
  if(content) {
    return Object.keys(content).map((mediaType: string) => {
      return openApiResponseMediaToVariants(code, mediaType, content[mediaType]);
    }).flat().filter(notEmpty);
  }
  return openApiResponseNoContentToVariant(code);
}

function routeVariants(openApiResponses?: OpenAPIV3.ResponsesObject) {
  if(!notEmpty(openApiResponses)) {
    return [];
  }
  return Object.keys(openApiResponses).map((code: string) => {
      const response = openApiResponses[code] as OpenAPIV3.ResponseObject;
      return openApiResponseCodeToVariants(code, response);
  }).flat().filter(notEmpty);
}

function getMockServerRouteId(openApiOperation: OpenAPIV3.OperationObject<{[MOCKS_SERVER_ROUTE_ID]?: string}>): string | undefined {
  return openApiOperation[MOCKS_SERVER_ROUTE_ID];
}

function openApiPathToRoutes(path: string, basePath = "", openApiPathObject?: OpenAPIV3.PathItemObject ): Routes | null {
  if(!notEmpty(openApiPathObject)) {
    return null;
  }
  return methods.map(method => {
    if(notEmpty(openApiPathObject[method])) {
      const openApiOperation = openApiPathObject[method] as OpenAPIV3.OperationObject;
      return {
        id: routeId(path, method, getMockServerRouteId(openApiOperation)),
        url: routeUrl(path, basePath),
        method,
        variants: routeVariants(openApiOperation.responses),
      };
    }
  }).filter(notEmpty);
}

function openApiMockDocumentToRoutes(openApiMockDocument: OpenApiMockDocument): Routes {
  const openApiDocument = openApiMockDocument.document;
  const basePath = openApiMockDocument.basePath;

  const paths = openApiDocument.paths || {};
  return Object.keys(paths).map((path: string) => {
    return openApiPathToRoutes(path, basePath, paths[path]);
  }).flat().filter(notEmpty);
}

export function openApiMockDocumentsToRoutes(openApiMockDocuments: OpenApiMockDocuments): Routes {
  return openApiMockDocuments.map(openApiMockDocumentToRoutes).flat();
}
