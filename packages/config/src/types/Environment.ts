import type { ConfigObject } from "./Common";
import type { Namespaces } from "./Namespace";

export interface EnvironmentConstructor {
  new (moduleName: string): EnvironmentInterface
}

export interface EnvironmentInterface {
  read(namespaces: Namespaces): ConfigObject
}
