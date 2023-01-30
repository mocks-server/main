import type { ModuleName, ConfigurationObject } from "./CommonTypes";

export interface FilesReadOptions {
  searchPlaces?: string[];
  searchFrom?: string;
  searchStop?: string;
}

export interface FilesConstructor {
  new (moduleName: ModuleName): FilesInterface;
}

export interface FilesInterface {
  read(
    initialConfig: ConfigurationObject,
    options: FilesReadOptions
  ): Promise<ConfigurationObject>;
  loadedFile: string | null;
}
