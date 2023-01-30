import { cosmiconfig } from "cosmiconfig";
import { isFunction } from "lodash";

import type { ConfigurationObject, ConfigFunction, ModuleName } from "./CommonTypes";
import type { FilesConstructor, FilesInterface, FilesReadOptions } from "./FilesTypes";

export const Files: FilesConstructor = class Files implements FilesInterface {
  private _moduleName: ModuleName;
  private _loadedFrom: null | string;
  private _config: ConfigurationObject;

  constructor(moduleName: string) {
    this._moduleName = moduleName;
    this._loadedFrom = null;
    this._config = {};
  }

  private async _transformConfig(
    config: ConfigurationObject | ConfigFunction,
    initConfig: ConfigurationObject
  ): Promise<ConfigurationObject> {
    if (isFunction(config)) {
      return config(initConfig);
    }
    console.log(config);
    return config;
  }

  public async read(
    initConfig: ConfigurationObject,
    { searchPlaces, searchFrom, searchStop }: FilesReadOptions
  ): Promise<ConfigurationObject> {
    interface PrivateOptions extends FilesReadOptions {
      stopDir: string;
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
};
