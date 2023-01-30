import type { ConfigurationObject, ConfigFunction } from "./CommonTypes";

export interface FilesReadOptions {
  searchPlaces?: string[];
  searchFrom?: string;
  searchStop?: string;
}

export interface FilesConstructor {
  new (
    config: ConfigurationObject | ConfigFunction,
    initConfig: ConfigurationObject
  ): FilesInterface;
}

export interface FilesInterface {
  read(
    initialConfig: ConfigurationObject,
    options: FilesReadOptions
  ): Promise<ConfigurationObject>;
  loadedFile: string | null;
}
