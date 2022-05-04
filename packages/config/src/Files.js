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

  async read(initConfig) {
    const explorer = cosmiconfig.cosmiconfig(this._moduleName, { stopDir: process.cwd() });
    const result = await explorer.search();

    if (!result) {
      return {};
    }

    this._loadedFrom = result.filepath;

    this._config = await this._transformConfig(result.config, initConfig);
    return { ...this._config };
  }
}

module.exports = Files;
