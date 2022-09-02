const cosmiconfig = require("cosmiconfig");
const { isFunction } = require("lodash");

class Files {
  constructor(moduleName) {
    this._moduleName = moduleName;
    this._loadedFrom = null;
    this._config = {};
  }

  async _transformConfig(config, initConfig) {
    if (isFunction(config)) {
      return config(initConfig);
    }
    return config;
  }

  async read(initConfig, { searchPlaces, searchFrom, searchStop }) {
    const options = {
      stopDir: searchStop || process.cwd(),
    };
    if (searchPlaces) {
      options.searchPlaces = searchPlaces;
    }
    const explorer = cosmiconfig.cosmiconfig(this._moduleName, options);
    const result = await explorer.search(searchFrom);

    if (!result) {
      return {};
    }

    this._loadedFrom = result.filepath;

    this._config = await this._transformConfig(result.config, initConfig);
    return { ...this._config };
  }

  get loadedFile() {
    return this._loadedFrom;
  }
}

module.exports = Files;
