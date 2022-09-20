import type { OptionInterface, OptionProperties, SetMethodOptions } from "./Option";
import type { ConfigObject, ObjectWithName } from "./Common";

export interface NamespaceProperties {
  parents: NamespaceInterface[]
  brothers: NamespaceInterface[]
  root?: NamespaceInterface
}

export interface NamespaceConstructor {
  new (name: string, options: NamespaceProperties): NamespaceInterface
}
export interface NamespaceInterface extends ObjectWithName {
  options: OptionInterface[]
  namespaces: NamespaceInterface[]
  parents: NamespaceInterface[],
  value: ConfigObject,
  root?: NamespaceInterface,
  name: string
  startEvents(): void
  addOption(optionProperties: OptionProperties): OptionInterface
  addOptions(options: OptionProperties[]): OptionInterface[]
  set(configuration: ConfigObject, options: SetMethodOptions): void
  addNamespace(name: NamespaceInterface["name"]): NamespaceInterface
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined
  option(name: OptionInterface["name"]): OptionInterface | undefined
}
