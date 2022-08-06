const path = require("path");

const { validateFileContent } = require("../helpers");

const ID = "collections";
const FILE_NAME = "collections";
const LEGACY_FILE_NAME = "mocks";

function findFile(filesContents, fileName) {
  return filesContents.find((fileDetails) => {
    return path.basename(fileDetails.path).startsWith(fileName);
  });
}

function getFileToUse(filesContents) {
  return findFile(filesContents, FILE_NAME) || findFile(filesContents, LEGACY_FILE_NAME);
}

class CollectionsLoader {
  constructor({ loadCollections, createLoader, getBasePath }) {
    this._loader = createLoader({
      id: ID,
      src: [FILE_NAME, LEGACY_FILE_NAME],
      onLoad: this._onLoad.bind(this),
    });

    this._getBasePath = getBasePath;
    this._loadCollections = loadCollections;
    this._logger = this._loader.logger;
    this._alerts = this._loader.alerts;
    this._deprecationAlerts = this._loader.alerts.collection("deprecated");
  }

  _onLoad(filesContents, filesErrors) {
    this._alerts.clean();
    const fileToUse = getFileToUse(filesContents);

    if (!filesContents.length && !filesErrors.length) {
      this._alerts.set(
        "not-found",
        `No collections file was found: '${path.resolve(this._getBasePath(), FILE_NAME)}.*'`
      );
    }

    if (fileToUse) {
      const filePath = fileToUse.path;
      const fileContent = fileToUse.content;
      const fileName = path.basename(filePath);
      // LEGACY, to be removed
      if (fileName.startsWith(LEGACY_FILE_NAME)) {
        this._deprecationAlerts.set(
          LEGACY_FILE_NAME,
          `Defining collections in '${fileName}' file is deprecated. Please rename it to '${fileName.replace(
            LEGACY_FILE_NAME,
            FILE_NAME
          )}'`
        );
      } else {
        this._deprecationAlerts.remove(LEGACY_FILE_NAME);
      }

      try {
        const fileErrors = validateFileContent(fileContent);
        if (!!fileErrors) {
          throw new Error(fileErrors);
        }
        this._loadCollections(fileContent);
        this._logger.debug(`Loaded collections from file '${filePath}'`);
      } catch (error) {
        this._loadCollections([]);
        this._alerts.set("error", `Error loading collections from file '${filePath}'`, error);
      }
    } else {
      this._loadCollections([]);
    }
  }
}

module.exports = CollectionsLoader;
