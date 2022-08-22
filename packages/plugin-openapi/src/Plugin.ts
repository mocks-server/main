import type { Routes, Core, MockLoaders, FilesContents } from "@mocks-server/core";

import { openApisToRoutes } from "./openapi";

const PLUGIN_ID = "openapi";
const DEFAULT_FOLDER = "openapi";

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
  }

  async _getRoutesFromFilesContents(filesContents: FilesContents): Promise<Routes> {
    const openApiMockDocuments = await Promise.all(
      filesContents.map((fileDetails) => {
        const fileContent = fileDetails.content;
        // TODO, validate file content
        this._logger.debug(`Creating routes from openApi definitions: '${JSON.stringify(fileContent)}'`);
        return openApisToRoutes(fileContent, {
          defaultLocation: fileDetails.path,
          logger: this._logger,
          alerts: this._documentsAlerts
        });
      })
    );
    return openApiMockDocuments.flat();
  }

  async _onLoadFiles(filesContents: FilesContents) {
    this._documentsAlerts.clean();
    const routes = await this._getRoutesFromFilesContents(filesContents);
    this._logger.debug(`Routes to load from openApi definitions: '${JSON.stringify(routes)}'`);
    this._logger.verbose(`Loading ${routes.length} routes from openApi definitions found in folder '${this._files.path}/${DEFAULT_FOLDER}'`);
    this._loadRoutes(routes);
  }
}

export default Plugin;
