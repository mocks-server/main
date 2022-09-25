import type { JSONSchema7 } from "json-schema";

import type { SchemaValidationResult } from "./Validation";
import type { ConfigObject, ObjectWithName } from "./Common";
import type { OptionInterface, SetMethodOptions, OptionProperties } from "./Option";

export interface ConfigOptions {
  moduleName: string,
  mergeArrays?: boolean
}

export interface ConfigConstructor {
  new (option: ConfigOptions): ConfigInterface
}

export interface ValidationOptions {
  allowAdditionalProperties?: boolean
}

export interface LoadArgumentsOptions {
  allowUnknown: boolean
}

export interface ConfigInterface {
  validate(config: ConfigObject, options?: ValidationOptions): SchemaValidationResult
  getValidationSchema(options?: ValidationOptions): JSONSchema7
  init(programmaticConfig: ConfigObject): Promise<void>
  load(programmaticConfig: ConfigObject): Promise<void>
  addNamespace(name: NamespaceInterface["name"]): NamespaceInterface
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined
  option(name: OptionInterface["name"]): OptionInterface | undefined
  addOption(optionProperties: OptionProperties): OptionInterface
  addOptions(options: OptionProperties[]): OptionInterface[]
  value: ConfigObject
  programmaticLoadedValues: ConfigObject
  fileLoadedValues: ConfigObject
  envLoadedValues: ConfigObject
  argsLoadedValues: ConfigObject
  loadedFile: string | null
  namespaces: NamespaceInterface[]
  options: OptionInterface[]
  root: ConfigInterface
  set(configuration: ConfigObject, options?: SetMethodOptions): void 
}

export interface NamespaceProperties {
  parents?: NamespaceInterface[]
  brothers: NamespaceInterface[]
  root: ConfigInterface
  isRoot?: true
}

export interface NamespaceConstructor {
  new (name?: string, options?: NamespaceProperties): NamespaceInterface
}
export interface NamespaceInterface extends ObjectWithName {
  options: OptionInterface[]
  namespaces: NamespaceInterface[]
  parents: NamespaceInterface[],
  value: ConfigObject,
  root: ConfigInterface,
  isRoot: boolean,
  name: string
  startEvents(): void
  addOption(optionProperties: OptionProperties): OptionInterface
  addOptions(options: OptionProperties[]): OptionInterface[]
  set(configuration: ConfigObject, options: SetMethodOptions): void
  addNamespace(name?: NamespaceInterface["name"]): NamespaceInterface
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined
  option(name: OptionInterface["name"]): OptionInterface | undefined
}
