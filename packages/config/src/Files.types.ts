import type { ModuleName, ConfigurationObject } from "./Common.types";

export interface FilesReadOptions {
  searchPlaces?: string[];
  searchFrom?: string;
  searchStop?: string;
}

export interface FilesConstructor {
  new (moduleName: ModuleName): FilesInterface;
}

export interface FilesInterface {
  /** Path to the config file that has been loaded */
  loadedFile: string | null;
  /** Read config from file
   * @param initialConfig - Initial config object
   * @param options - Options for reading config
   * @returns Config object from file
   **/
  read(
    initialConfig: ConfigurationObject,
    options: FilesReadOptions
  ): Promise<ConfigurationObject>;
}
