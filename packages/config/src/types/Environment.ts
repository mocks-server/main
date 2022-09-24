import type { ConfigObject } from "./Common";
import type { NamespaceInterface } from "./Config";

export interface EnvironmentConstructor {
  new (moduleName: string): EnvironmentInterface
}

export interface EnvironmentInterface {
  read(namespaces: NamespaceInterface[]): ConfigObject
}
