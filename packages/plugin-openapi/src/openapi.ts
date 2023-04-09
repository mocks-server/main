import { OpenAPIV3 as OpenAPIV3Object } from "openapi-types";
import { resolveRefs } from "json-refs";

import type { ResolvedRefsResults, UnresolvedRefDetails } from "json-refs";
import type { Alerts, HTTPHeaders, Routes, RouteVariant, RouteVariants, RouteVariantTypes } from "@mocks-server/core";
import type { OpenApiDefinition, OpenAPIV3 } from "./types";

import { MOCKS_SERVER_ROUTE_ID, MOCKS_SERVER_VARIANT_ID, VariantTypes, CONTENT_TYPE_HEADER } from "./constants";

const methods = Object.values(OpenAPIV3Object.HttpMethods);

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function replaceTemplateInPath(path: string): string {
  // /api/users/{userId} -> api/users/:userId
  return path.replace(/{(\S*?)}/gim, ":$1")
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

function openApiResponseExampleToVariant(exampleId: string, code: number, variantType: RouteVariantTypes, mediaType: string, openApiResponseExample: OpenAPIV3.ExampleObject, openApiResponseHeaders?:  OpenAPIV3.ResponseHeaders): RouteVariant | null {
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

function openApiResponseNoContentToVariant(code: number, openApiResponse: OpenAPIV3.ResponseObject ): RouteVariant {
  const baseVariant = openApiResponseBaseVariant(VariantTypes.STATUS, code, { customId: openApiResponse[MOCKS_SERVER_VARIANT_ID] });
  return {
    ...baseVariant,
    options: {
      headers: openApiResponse.headers as HTTPHeaders,
      status: code,
    } 
  } as RouteVariant;
}

function openApiResponseExamplesToVariants(code: number, variantType: RouteVariantTypes, mediaType: string, openApiResponseMediaType: OpenAPIV3.MediaTypeObject, openApiResponseHeaders?: OpenAPIV3.ResponseHeaders): RouteVariants {
  const examples = openApiResponseMediaType.examples;
  if(!notEmpty(examples)) {
    return null;
  }
  return Object.keys(examples).map((exampleId: string) => {
    return openApiResponseExampleToVariant(exampleId, code, variantType, mediaType, examples[exampleId] as OpenAPIV3.ExampleObject , openApiResponseHeaders);
  }).filter(notEmpty);
}

function openApiResponseMediaToVariants(code: number, mediaType: string, openApiResponseMediaType?: OpenAPIV3.MediaTypeObject, openApiResponseHeaders?: OpenAPIV3.ResponseHeaders): RouteVariants  {
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

function openApiResponseCodeToVariants(code: number, openApiResponse?: OpenAPIV3.ResponseObject): RouteVariants  {
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
      const response = openApiResponses[code] as OpenAPIV3.ResponseObject;
      return openApiResponseCodeToVariants(getStatusCode(code, codes), response);
  }).flat().filter(notEmpty);
}

function getCustomRouteId(openApiOperation: OpenAPIV3.OperationObject): string | undefined {
  return openApiOperation[MOCKS_SERVER_ROUTE_ID] || openApiOperation.operationId;
}

function openApiPathToRoutes(path: string, basePath = "", openApiPathObject?: OpenAPIV3.PathItemObject ): Routes | null {
  if(!notEmpty(openApiPathObject)) {
    return null;
  }
  return methods.map(method => {
    if(notEmpty(openApiPathObject[method])) {
      const openApiOperation = openApiPathObject[method] as OpenAPIV3.OperationObject;
      return {
        id: routeId(path, method, getCustomRouteId(openApiOperation)),
        url: routeUrl(path, basePath),
        method,
        variants: routeVariants(openApiOperation.responses),
      };
    }
  }).filter(notEmpty);
}

function openApiDefinitionToRoutes(openApiDefinition: OpenApiDefinition.Definition): Routes {
  const openApiDocument = openApiDefinition.document;
  const basePath = openApiDefinition.basePath;

  const paths = openApiDocument.paths || {};
  return Object.keys(paths).map((path: string) => {
    return openApiPathToRoutes(path, basePath, paths[path]);
  }).flat().filter(notEmpty);
}

function documentRefsErrors(refsResults: ResolvedRefsResults): Error[] {
  const refs = refsResults.refs;
  return Object.keys(refs).map((refKey) => {
    // @ts-expect-error expression of type 'string' can't be used to index type 'ResolvedRefDetails', but resolvedRefDetails.refs is in fact an object
    const ref = refs[refKey] as UnresolvedRefDetails;
    if(ref.error) {
      return new Error(ref.error);
    }
    return null;
  }).filter(notEmpty)
}

function addOpenApiRefAlert(alerts: Alerts, error: Error): void {
  alerts.set(String(alerts.flat.length), "Error resolving openapi $ref", error);
}

function resolveDocumentRefs(document: OpenAPIV3.Document, refsOptions: OpenApiDefinition.Refs, { alerts, logger }: OpenApiDefinition.Options): Promise<OpenAPIV3.Document | null> {
  return resolveRefs(document, refsOptions).then((res) => {
    if (logger) {
      logger.silly(`Document with resolved refs: '${JSON.stringify(res)}'`);
    }
    const refsErrors = documentRefsErrors(res);
    if (refsErrors.length) {
      if(alerts) {
        refsErrors.forEach((error: Error) => {
          addOpenApiRefAlert(alerts, error);
        })
      } else {
        throw new Error(refsErrors.map((error) => error.message).join(". "));
      }
    }
    return res.resolved as OpenAPIV3.Document;
  }).catch((error) => {
    if(alerts) {
      alerts.set(String(alerts.flat.length), "Error loading openapi definition", error);
      return null;
    }
    return Promise.reject(error);
  });
}

async function resolveOpenApiDocumentRefs(openApiDefinition: OpenApiDefinition.Definition, { defaultLocation, alerts, logger }: OpenApiDefinition.Options = {}): Promise<OpenApiDefinition.Definition | null> {
  const document = await resolveDocumentRefs(openApiDefinition.document, {location: defaultLocation, ...openApiDefinition.refs}, { alerts, logger });
  if(document) {
    return {
      ...openApiDefinition,
      document,
    }
  }
  return null;
}

export async function openApiRoutes(openApiDefinition: OpenApiDefinition.Definition, advancedOptions?: OpenApiDefinition.Options): Promise<Routes> {
  const resolvedOpenApiDefinition = await resolveOpenApiDocumentRefs(openApiDefinition, advancedOptions);
  if(!resolvedOpenApiDefinition) {
    return [];
  }
  return openApiDefinitionToRoutes(resolvedOpenApiDefinition);
}
