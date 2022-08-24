import type { Route, Routes, Collections, Collection, Core, MockLoaders, FilesContents, ConfigOption } from "@mocks-server/core";

import { openApiRoutes } from "./openapi";
import type { OpenApiDefinition } from "./types";

const PLUGIN_ID = "openapi";
const DEFAULT_FOLDER = "openapi";

const COLLECTION_NAMESPACE = "collection";

const COLLECTION_OPTIONS = [
  {
    description: "Name for the collection created from OpenAPI definitions",
    name: "id",
    type: "string",
    default: "openapi",
  },
  {
    description: "Name of the collection to extend from",
    name: "from",
    type: "string"
  },
];

interface RoutesAndCollections {
  routes: Routes,
  collections: Collections,
}

function getRoutesCollection(routes: Routes, collectionOptions?: OpenApiDefinition.Collection): Collection | null {
  if (!collectionOptions) {
    return null;
  }
  return routes.reduce((collection, route: Route) => {
    if (route.variants && route.variants.length) {
      collection.routes.push(`${route.id}:${route.variants[0].id}`)
    }
    return collection;
  }, { id: collectionOptions.id, from: collectionOptions.from, routes: [] } as Collection);
}

class Plugin {
  static get id() {
    return PLUGIN_ID;
  }

  private _config: Core["config"]
  private _logger: Core["logger"]
  private _alerts: Core["alerts"]
  private _files: Core["files"]
  private _loadRoutes: MockLoaders["loadRoutes"]
  private _loadCollections: MockLoaders["loadCollections"]
  private _documentsAlerts: Core["alerts"]
  private _collectionNameOption: ConfigOption
  private _collectionFromOption: ConfigOption

  constructor({ logger, alerts, mock, files, config }: Core) {
    this._config = config;
    this._logger = logger;
    this._alerts = alerts;
    this._files = files;

    const configCollection = this._config.addNamespace(COLLECTION_NAMESPACE);
    [this._collectionNameOption, this._collectionFromOption] = configCollection.addOptions(COLLECTION_OPTIONS);

    this._documentsAlerts = this._alerts.collection("documents");

    const { loadRoutes, loadCollections } = mock.createLoaders();
    this._loadRoutes = loadRoutes;
    this._loadCollections = loadCollections;
    this._files.createLoader({
      id: PLUGIN_ID,
      src: `${DEFAULT_FOLDER}/**/*`,
      onLoad: this._onLoadFiles.bind(this),
    })
  }

  async _getRoutesAndCollectionsFromFilesContents(filesContents: FilesContents): Promise<RoutesAndCollections> {
    const openApiRoutesAndCollections = await Promise.all(
      filesContents.map((fileDetails) => {
        const fileContent = fileDetails.content;
        return fileContent.map((openAPIDefinition: OpenApiDefinition.Definition) => {
          this._logger.debug(`Creating routes from openApi definition: '${JSON.stringify(openAPIDefinition)}'`);
          return openApiRoutes(openAPIDefinition, {
            defaultLocation: fileDetails.path,
            logger: this._logger,
            alerts: this._documentsAlerts
          }).then((routes) => {
            return {
              routes,
              collection: getRoutesCollection(routes, openAPIDefinition.collection)
            }
          });
        });
      }).flat()
    );

    return openApiRoutesAndCollections.reduce((allRoutesAndCollections, definitionRoutesAndCollections) => {
      allRoutesAndCollections.routes = allRoutesAndCollections.routes.concat(definitionRoutesAndCollections.routes);
      if(definitionRoutesAndCollections.collection) {
        allRoutesAndCollections.collections = allRoutesAndCollections.collections.concat(definitionRoutesAndCollections.collection);
      }
      return allRoutesAndCollections;
    }, { routes: [], collections: []});
  }

  async _onLoadFiles(filesContents: FilesContents) {
    this._documentsAlerts.clean();
    const { routes, collections } = await this._getRoutesAndCollectionsFromFilesContents(filesContents);
    const folderTrace = `from OpenAPI definitions found in folder '${this._files.path}/${DEFAULT_FOLDER}'`;
    this._logger.debug(`Routes to load from openApi definitions: '${JSON.stringify(routes)}'`);
    this._logger.verbose(`Loading ${routes.length} routes ${folderTrace}`);
    this._loadRoutes(routes);
    this._logger.debug(`Collections to load from OpenAPI definitions: '${JSON.stringify(collections)}'`);
    this._logger.verbose(`Loading ${collections.length} collections ${folderTrace}`);
    this._loadCollections(collections);
  }
}

export default Plugin;
