import type { ConfigObject, ConfigFunction } from "./Common";

export interface ReadOptions {
  searchPlaces?: string[]
  searchFrom?: string
  searchStop?: string
}

export interface FilesConstructor {
  new (config: ConfigObject | ConfigFunction, initConfig: ConfigObject): FilesInterface
}

export interface FilesInterface {
  read(initialConfig: ConfigObject, options: ReadOptions): Promise<ConfigObject>
  loadedFile: string | null
}
