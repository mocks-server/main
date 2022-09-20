export type AnyObject = Record<string, unknown>

export interface ObjectWithName {
  name: string,
}

export interface ConfigFunction {
  (initialConfig: ConfigObject): ConfigObject
}

export type ConfigObject = Partial<AnyObject>
