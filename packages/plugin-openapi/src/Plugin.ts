import type { Core, MockLoaders, FilesContents } from "@mocks-server/core";

import { openApiMockDocumentsToRoutes } from "./openapi";

const PLUGIN_ID = "openapi";
const DEFAULT_FOLDER = "openapi";

// TODO, add options: path

class Plugin {
  static get id() {
    return PLUGIN_ID;
  }

  private _logger: Core["logger"]
  private _alerts: Core["alerts"]
  private _files: Core["files"]
  private _loadRoutes: MockLoaders["loadRoutes"]

  constructor({ logger, alerts, mock, files }: Core) {
    this._logger = logger;
    this._alerts = alerts;
    this._files = files;

    const { loadRoutes } = mock.createLoaders();
    this._loadRoutes = loadRoutes;
    this._files.createLoader({
      id: PLUGIN_ID,
      src: `${DEFAULT_FOLDER}/**/*`,
      onLoad: this._onLoadFiles.bind(this),
    })
  }

  _onLoadFiles(filesContents: FilesContents) {
    const openApiMockDocuments = filesContents
      .map((fileDetails) => {
        return fileDetails.content;
      }).flat();
    this._logger.debug(`Creating routes from openApi definitions: '${JSON.stringify(openApiMockDocuments)}'`);
    const routes = openApiMockDocumentsToRoutes(openApiMockDocuments);
    this._logger.debug(`Routes to load from openApi definitions: '${JSON.stringify(routes)}'`);
    this._logger.verbose(`Loading ${routes.length} routes from openApi definitions found in '${this._files.path}/${DEFAULT_FOLDER}'`);
    this._loadRoutes(routes);
  }
}

export default Plugin;
