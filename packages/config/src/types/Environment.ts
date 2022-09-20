import type { ConfigObject } from "./Common";
import type { NamespaceInterface } from "./Namespace";

export interface EnvironmentConstructor {
  new (moduleName: string): EnvironmentInterface
}

export interface EnvironmentInterface {
  read(namespaces: NamespaceInterface[]): ConfigObject
}
