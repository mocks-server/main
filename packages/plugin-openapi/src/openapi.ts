import type { OpenAPIV3 } from "openapi-types";
import type { HTTPHeaders, Routes, RouteVariant, RouteVariants, RouteVariantTypes } from "@mocks-server/core";

import { OpenAPIV3 as OpenApiV3Object } from "openapi-types";
import type { OpenApiMockDocuments, OpenApiMockDocument, ResponseObjectWithVariantId, ExampleObjectWithVariantId, OperationObjectWithRouteId, ResponseHeaders } from "./types";

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID, VariantTypes, CONTENT_TYPE_HEADER } from "./constants";

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
  return mediaType.includes("application/json");
}

function isTextMediaType(mediaType: string): boolean {
  return mediaType.includes("text/");
}

function openApiResponseBaseVariant(variantType: RouteVariantTypes, code: number, options: { customId?: string, exampleId?: string }): Partial<RouteVariant> {
  let id;
  if (options.customId) {
    id = options.customId;
  } else {
    id = options.exampleId ? `${code}-${variantType}-${options.exampleId}` : `${code}-${variantType}` 
  }
  return {
    id,
    type: variantType,
  };
}

function replaceCodeWildcards(code: string): string {
  return code.replace(/X/gim, "0");
}

function hasAnySuccessCode(codes: string[]): boolean {
  return !!codes.find((code) => {
    return code.startsWith("1") || code.startsWith("2") || code.startsWith("3");
  });
}

function getStatusCode(code: string, codes: string[]): number {
  const statusCodes = codes.map(replaceCodeWildcards)
  if (code === "default") {
    return hasAnySuccessCode(statusCodes) ? 400 : 200;
  }
  return Number(replaceCodeWildcards(code));
}

// TODO, support also ReferenceObject in examples
function openApiResponseExampleToVariant(exampleId: string, code: number, variantType: RouteVariantTypes, mediaType: string, openApiResponseExample: ExampleObjectWithVariantId, openApiResponseHeaders?: ResponseHeaders): RouteVariant | null {
  if(!notEmpty(openApiResponseExample) || !notEmpty(openApiResponseExample.value)) {
    return null;
  }
  
  const baseVariant = openApiResponseBaseVariant(variantType, code, { exampleId, customId: openApiResponseExample[MOCKS_SERVER_VARIANT_ID] });

  return {
    ...baseVariant,
    options: {
      headers: {
        ...openApiResponseHeaders,
        [CONTENT_TYPE_HEADER]: mediaType,
      },
      status: code,
      body: openApiResponseExample.value
    } 
  } as RouteVariant;
}

function openApiResponseNoContentToVariant(code: number, openApiResponse: ResponseObjectWithVariantId): RouteVariant {
  const baseVariant = openApiResponseBaseVariant(VariantTypes.STATUS, code, { customId: openApiResponse[MOCKS_SERVER_VARIANT_ID] });
  return {
    ...baseVariant,
    options: {
      // TODO, convert possible ref
      headers: openApiResponse.headers as HTTPHeaders,
      status: code,
    } 
  } as RouteVariant;
}

function openApiResponseExamplesToVariants(code: number, variantType: RouteVariantTypes, mediaType: string, openApiResponseMediaType: OpenAPIV3.MediaTypeObject, openApiResponseHeaders?: ResponseHeaders): RouteVariants {
  const examples = openApiResponseMediaType.examples;
  if(!notEmpty(examples)) {
    return null;
  }
  return Object.keys(examples).map((exampleId: string) => {
    // TODO, support also ReferenceObject in examples
    return openApiResponseExampleToVariant(exampleId, code, variantType, mediaType, examples[exampleId] as ExampleObjectWithVariantId, openApiResponseHeaders);
  }).filter(notEmpty);
}

function openApiResponseMediaToVariants(code: number, mediaType: string, openApiResponseMediaType?: OpenAPIV3.MediaTypeObject, openApiResponseHeaders?: ResponseHeaders): RouteVariants  {
  if(!notEmpty(openApiResponseMediaType)) {
    return null;
  }
  if(isJsonMediaType(mediaType)) {
    return openApiResponseExamplesToVariants(code, VariantTypes.JSON, mediaType, openApiResponseMediaType, openApiResponseHeaders);
  }
  if(isTextMediaType(mediaType)) {
    return openApiResponseExamplesToVariants(code,  VariantTypes.TEXT, mediaType, openApiResponseMediaType, openApiResponseHeaders);
  }
  return null;
}

function openApiResponseCodeToVariants(code: number, openApiResponse?: ResponseObjectWithVariantId): RouteVariants  {
  if(!notEmpty(openApiResponse)) {
    return [];
  }
  const content = openApiResponse.content;
  if(content) {
    return Object.keys(content).map((mediaType: string) => {
      return openApiResponseMediaToVariants(code, mediaType, content[mediaType], openApiResponse.headers);
    }).flat().filter(notEmpty);
  }
  return [openApiResponseNoContentToVariant(code, openApiResponse)];
}

function routeVariants(openApiResponses?: OpenAPIV3.ResponsesObject): RouteVariants {
  if(!notEmpty(openApiResponses)) {
    return [];
  }
  const codes = Object.keys(openApiResponses);

  return codes.map((code: string) => {
      const response = openApiResponses[code] as ResponseObjectWithVariantId;
      return openApiResponseCodeToVariants(getStatusCode(code, codes), response);
  }).flat().filter(notEmpty);
}

function getCustomRouteId(openApiOperation: OperationObjectWithRouteId): string | undefined {
  return openApiOperation[MOCKS_SERVER_ROUTE_ID] || openApiOperation.operationId;
}

function openApiPathToRoutes(path: string, basePath = "", openApiPathObject?: OpenAPIV3.PathItemObject ): Routes | null {
  if(!notEmpty(openApiPathObject)) {
    return null;
  }
  return methods.map(method => {
    if(notEmpty(openApiPathObject[method])) {
      const openApiOperation = openApiPathObject[method] as OperationObjectWithRouteId;
      return {
        id: routeId(path, method, getCustomRouteId(openApiOperation)),
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
