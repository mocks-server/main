export type AnyObject = Record<string, unknown>;

export interface ObjectWithName {
  name: string;
}

export interface ConfigFunction {
  (initialConfig: ConfigurationObject): ConfigurationObject;
}

export type ConfigurationObject = Partial<AnyObject>;
