import { cosmiconfig } from "cosmiconfig";
import { isFunction } from "lodash";
import type { FilesInterface, ReadOptions } from "./types/Files";
import type { ConfigObject, ConfigFunction } from "./types/Common";

class Files implements FilesInterface {
  private _moduleName: string
  private _loadedFrom: null | string
  private _config: ConfigObject

  constructor(moduleName: string) {
    this._moduleName = moduleName;
    this._loadedFrom = null;
    this._config = {};
  }

  private async _transformConfig(config: ConfigObject | ConfigFunction, initConfig: ConfigObject): Promise<ConfigObject> {
    if (isFunction(config)) {
      return config(initConfig);
    }
    console.log(config);
    return config;
  }

  public async read(initConfig: ConfigObject, { searchPlaces, searchFrom, searchStop }: ReadOptions): Promise<ConfigObject> {
    interface PrivateOptions extends ReadOptions {
      stopDir: string
    }
    const options: PrivateOptions = {
      stopDir: searchStop || process.cwd(),
    };
    if (searchPlaces) {
      options.searchPlaces = searchPlaces;
    }
    const explorer = cosmiconfig(this._moduleName, options);
    const result = await explorer.search(searchFrom);

    if (!result) {
      return {};
    }

    this._loadedFrom = result.filepath;

    this._config = await this._transformConfig(result.config, initConfig);
    return { ...this._config };
  }

  public get loadedFile(): string | null {
    return this._loadedFrom;
  }
}

export default Files;
