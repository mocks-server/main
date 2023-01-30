import type { ConfigurationObject } from "./CommonTypes";
import type { NamespaceInterface } from "./ConfigTypes";

export interface EnvironmentConstructor {
  new (moduleName: string): EnvironmentInterface;
}

export interface EnvironmentInterface {
  read(namespaces: NamespaceInterface[]): ConfigurationObject;
}
