const path = require("path");

const { validateFileContent } = require("../helpers");

const ID = "collections";
const FILE_NAME = "collections";

function findFile(filesContents, fileName) {
  return filesContents.find((fileDetails) => {
    return path.basename(fileDetails.path).startsWith(fileName);
  });
}

function getFileToUse(filesContents) {
  return findFile(filesContents, FILE_NAME);
}

class CollectionsLoader {
  constructor({ loadCollections, createLoader, getBasePath }) {
    this._loader = createLoader({
      id: ID,
      src: [FILE_NAME],
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
