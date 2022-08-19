import { resolveRefs } from "json-refs";

import type { Core, MockLoaders, FilesContents } from "@mocks-server/core";
import type { OpenAPIV3 } from "openapi-types";
import type { ResolvedRefsResults, UnresolvedRefDetails } from "json-refs";
import type { OpenApiMockDocuments, OpenApiMockDocument } from "./types";

import { openApiMockDocumentsToRoutes, notEmpty } from "./openapi";

const PLUGIN_ID = "openapi";
const DEFAULT_FOLDER = "openapi";

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

class Plugin {
  static get id() {
    return PLUGIN_ID;
  }

  private _logger: Core["logger"]
  private _alerts: Core["alerts"]
  private _files: Core["files"]
  private _loadRoutes: MockLoaders["loadRoutes"]
  private _documentsAlerts: Core["alerts"]

  constructor({ logger, alerts, mock, files }: Core) {
    this._logger = logger;
    this._alerts = alerts;
    this._files = files;

    this._documentsAlerts = this._alerts.collection("documents");

    const { loadRoutes } = mock.createLoaders();
    this._loadRoutes = loadRoutes;
    this._files.createLoader({
      id: PLUGIN_ID,
      src: `${DEFAULT_FOLDER}/**/*`,
      onLoad: this._onLoadFiles.bind(this),
    })
    this._resolveMockDocumentRefs = this._resolveMockDocumentRefs.bind(this);
    this._addOpenApiRefAlert = this._addOpenApiRefAlert.bind(this);
  }

  _addOpenApiRefAlert(error: Error): void {
    this._documentsAlerts.set(String(this._documentsAlerts.flat.length), "Error resolving openapi $ref", error);
  }

  _resolveDocumentRefs(document: OpenAPIV3.Document, refsOptions?: OpenApiMockDocument["refs"]): Promise<OpenAPIV3.Document | null> {
    return resolveRefs(document, refsOptions).then((res) => {
      this._logger.silly(`Document with resolved refs: '${JSON.stringify(res)}'`);
      const refsErrors = documentRefsErrors(res);
      refsErrors.forEach(this._addOpenApiRefAlert)
      return res.resolved as OpenAPIV3.Document;
    }).catch((error) => {
      this._documentsAlerts.set(String(this._documentsAlerts.flat.length), "Error loading openapi definition", error);
      return null;
    });
  }

  async _resolveMockDocumentRefs(documentMock: OpenApiMockDocument): Promise<OpenApiMockDocument | null> {
    const document = await this._resolveDocumentRefs(documentMock.document, documentMock.refs);
    if(document) {
      return {
        ...documentMock,
        document,
      }
    }
    return null;
  }

  _resolveMockDocumentsRefs(documents: OpenApiMockDocuments): Promise<OpenApiMockDocuments> {
    return Promise.all(documents.map(this._resolveMockDocumentRefs)).then((resolvedDocuments) => {
      return resolvedDocuments.filter(notEmpty);
    })
  }

  async _onLoadFiles(filesContents: FilesContents) {
    this._documentsAlerts.clean();
    const openApiMockDocuments = filesContents
      .map((fileDetails) => {
        return fileDetails.content;
      }).flat();
    this._logger.debug(`Resolving refs in openApi definitions: '${JSON.stringify(openApiMockDocuments)}'`);
    const resolvedOpenApiMockDocuments = await this._resolveMockDocumentsRefs(openApiMockDocuments);
    this._logger.debug(`Creating routes from openApi definitions: '${JSON.stringify(resolvedOpenApiMockDocuments)}'`);
    const routes = openApiMockDocumentsToRoutes(resolvedOpenApiMockDocuments);
    this._logger.debug(`Routes to load from openApi definitions: '${JSON.stringify(routes)}'`);
    this._logger.verbose(`Loading ${routes.length} routes from openApi definitions found in '${this._files.path}/${DEFAULT_FOLDER}'`);
    this._loadRoutes(routes);
  }
}

export default Plugin;
