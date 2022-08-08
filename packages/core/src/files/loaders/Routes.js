const path = require("path");

const { flatten } = require("lodash");

const { validateFileContent } = require("../helpers");

const ID = "routes";
const FOLDER_NAME = "routes";

class RoutesLoader {
  constructor({ loadRoutes, createLoader, getBasePath }) {
    this._loader = createLoader({
      id: ID,
      src: `${FOLDER_NAME}/**/*`,
      onLoad: this._onLoad.bind(this),
    });

    this._getBasePath = getBasePath;
    this._loadRoutes = loadRoutes;
    this._logger = this._loader.logger;
    this._alerts = this._loader.alerts;
    this._alertsFiles = this._alerts.collection("file");
  }

  _onLoad(filesContents) {
    this._alerts.clean();
    this._logger.debug(`Loading routes. ${filesContents.length} route files found.`);
    const routes = flatten(
      filesContents
        .map((fileDetails) => {
          const filePath = fileDetails.path;
          const fileContent = fileDetails.content;

          const fileErrors = validateFileContent(fileContent);
          if (!!fileErrors) {
            this._alertsFiles.set(
              filePath,
              `Error loading routes from file ${filePath}: ${fileErrors}`
            );
            return null;
          }
          return fileContent;
        })
        .filter((fileContent) => !!fileContent)
    );
    this._loadRoutes(routes);
    this._logger.verbose(
      `Loaded routes from folder '${path.resolve(this._getBasePath(), FOLDER_NAME)}'`
    );
  }
}

module.exports = RoutesLoader;
