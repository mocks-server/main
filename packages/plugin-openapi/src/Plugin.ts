import type {
  OptionProperties,
  OptionInterface,
  ConfigNamespaceInterface,
} from "@mocks-server/config";
import type {
  RouteDefinition,
  ScopedCoreInterface,
  DefinitionsLoaders,
  FilesLoaded,
  CollectionDefinition,
  AlertsInterface,
  FilesInterface,
} from "@mocks-server/core";
import type { LoggerInterface } from "@mocks-server/logger";

import { openApiRoutes } from "./OpenApi";
import type { OpenApiDefinition, PluginConstructor, PluginInterface } from "./types";

const PLUGIN_ID = "openapi";
const DEFAULT_FOLDER = "openapi";

const COLLECTION_NAMESPACE = "collection";

const COLLECTION_OPTIONS: OptionProperties[] = [
  {
    description: "Name for the collection created from OpenAPI definitions",
    name: "id",
    type: "string",
    nullable: true,
    default: "openapi",
  },
  {
    description: "Name of the collection to extend from",
    name: "from",
    type: "string",
  },
];

interface RoutesAndCollections {
  routes: RouteDefinition[];
  collections: CollectionDefinition[];
}

function getRoutesCollection(
  routes: RouteDefinition[],
  collectionOptions?: OpenApiDefinition.Collection
): CollectionDefinition | null {
  if (!collectionOptions) {
    return null;
  }
  return routes.reduce(
    (collection: CollectionDefinition, route: RouteDefinition) => {
      if (route.variants && route.variants.length) {
        collection.routes.push(`${route.id}:${route.variants[0].id}`);
      }
      return collection;
    },
    {
      id: collectionOptions.id,
      from: collectionOptions.from || null,
      routes: [],
    } as CollectionDefinition
  );
}

export const Plugin: PluginConstructor = class Plugin implements PluginInterface {
  static get id() {
    return PLUGIN_ID;
  }

  private _config: ConfigNamespaceInterface;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _files: FilesInterface;
  private _loadRoutes: DefinitionsLoaders["loadRoutes"];
  private _loadCollections: DefinitionsLoaders["loadCollections"];
  private _documentsAlerts: AlertsInterface;
  private _collectionIdOption: OptionInterface;
  private _collectionFromOption: OptionInterface;

  constructor({ logger, alerts, mock, files, config }: ScopedCoreInterface) {
    this._config = config as ConfigNamespaceInterface; // TODO, remove cast when core ensures config
    this._logger = logger as LoggerInterface; // TODO, remove cast when core ensures logger
    this._alerts = alerts as AlertsInterface; // TODO, remove cast when core ensures alerts
    this._files = files;

    const configCollection = this._config.addNamespace(COLLECTION_NAMESPACE);
    [this._collectionIdOption, this._collectionFromOption] =
      configCollection.addOptions(COLLECTION_OPTIONS);

    this._documentsAlerts = this._alerts.collection("documents");

    const { loadRoutes, loadCollections } = mock.createLoaders();
    this._loadRoutes = loadRoutes;
    this._loadCollections = loadCollections;
    this._files.createLoader({
      id: PLUGIN_ID,
      src: `${DEFAULT_FOLDER}/**/*`,
      onLoad: this._onLoadFiles.bind(this),
    });
  }

  async _getRoutesAndCollectionsFromFilesContents(
    filesContents: FilesLoaded
  ): Promise<RoutesAndCollections> {
    const openApiRoutesAndCollections = await Promise.all(
      filesContents
        .map((fileDetails) => {
          const fileContent = fileDetails.content as OpenApiDefinition.Definition[];
          return fileContent.map((openAPIDefinition: OpenApiDefinition.Definition) => {
            this._logger.debug(
              `Creating routes from openApi definition: '${JSON.stringify(openAPIDefinition)}'`
            );
            return openApiRoutes(openAPIDefinition, {
              defaultLocation: fileDetails.path,
              logger: this._logger,
              alerts: this._documentsAlerts,
            }).then((routes) => {
              return {
                routes,
                collection: getRoutesCollection(routes, openAPIDefinition.collection),
              };
            });
          });
        })
        .flat()
    );

    return openApiRoutesAndCollections.reduce(
      (allRoutesAndCollections, definitionRoutesAndCollections) => {
        allRoutesAndCollections.routes = allRoutesAndCollections.routes.concat(
          definitionRoutesAndCollections.routes
        );
        if (definitionRoutesAndCollections.collection) {
          allRoutesAndCollections.collections = allRoutesAndCollections.collections.concat(
            definitionRoutesAndCollections.collection
          );
        }
        return allRoutesAndCollections;
      },
      { routes: [], collections: [] } as RoutesAndCollections
    );
  }

  private get _defaultCollectionOptions(): OpenApiDefinition.Collection | null {
    if (!this._collectionIdOption.value) {
      return null;
    }
    const options = {
      id: this._collectionIdOption.value as string,
    } as OpenApiDefinition.Collection;

    if (this._collectionFromOption.value) {
      options.from = this._collectionFromOption.value as string;
    }
    return options;
  }

  private async _onLoadFiles(filesContents: FilesLoaded) {
    if (filesContents.length) {
      let collectionsToLoad;
      this._documentsAlerts.clean();
      const { routes, collections } = await this._getRoutesAndCollectionsFromFilesContents(
        filesContents
      );
      const folderTrace = `from OpenAPI definitions found in folder '${this._files.path}/${DEFAULT_FOLDER}'`;

      this._logger.debug(`Routes to load from openApi definitions: '${JSON.stringify(routes)}'`);
      this._logger.verbose(`Loading ${routes.length} routes ${folderTrace}`);

      this._loadRoutes(routes);

      this._logger.debug(
        `Collections created from OpenAPI definitions: '${JSON.stringify(collections)}'`
      );

      if (this._defaultCollectionOptions) {
        const defaultCollection = getRoutesCollection(routes, this._defaultCollectionOptions);
        this._logger.debug(
          `Collection created from all OpenAPI definitions: '${JSON.stringify(defaultCollection)}'`
        );
        collectionsToLoad = collections.concat([defaultCollection as CollectionDefinition]);
      } else {
        collectionsToLoad = collections;
      }

      this._logger.verbose(`Loading ${collectionsToLoad.length} collections ${folderTrace}`);

      this._loadCollections(collectionsToLoad);
    }
  }
};
