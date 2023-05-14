import type { ConfigurationObject } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";

export interface EnvironmentConstructor {
  new (moduleName: string): EnvironmentInterface;
}

export interface EnvironmentInterface {
  read(namespaces: ConfigNamespaceInterface[]): ConfigurationObject;
}
