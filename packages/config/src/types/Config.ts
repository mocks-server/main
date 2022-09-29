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

/** Validation options */
export interface ValidationOptions {
  /** Ignore additional properties during validation */
  allowAdditionalProperties?: boolean
}

export interface LoadArgumentsOptions {
  allowUnknown: boolean
}

/** Root config interface */
export interface ConfigInterface {
  /**
  * Validates a provided object based on current configuration and namespaces options 
  * @param config - Configuration object to validate {@link ConfigObject}
  * @param options - Validation options {@link ValidationOptions}
  * @returns Validation result {@link SchemaValidationResult}.
  * @example config.validate({ option1: "foo", namespace: { option2: 3 } }, { allowAdditionalProperties: false })
  */
  validate(config: ConfigObject, options?: ValidationOptions): SchemaValidationResult
  /**
  * Returns a Json schema based on current namespaces and options
  * @param options - Validation options {@link ValidationOptions}
  * @returns Json schema {@link JSONSchema7}.
  * @example const schema = config.getValidationSchema({ allowAdditionalProperties: false })
  */
  getValidationSchema(options?: ValidationOptions): JSONSchema7
  /**
  * Initializes the config object and loads the value of current namespaces and options, but doesn't perform validation, allowing to add more options based on the values of the previous ones.
  * @param programmaticConfig - Programmatic configuration object {@link ConfigObject}
  * @example await config.init({ option: "value" })
  */
  init(programmaticConfig?: ConfigObject): Promise<void>
  /**
  * Loads values of all namespaces and options, and validates them.
  * @param programmaticConfig - Programmatic configuration object {@link ConfigObject}
  * @example await config.load({ option: "value" })
  */
  load(programmaticConfig?: ConfigObject): Promise<void>
  /**
  * Adds a configuration namespace, or returns an existing one in case the name already exists
  * @param name - Name for the new namespace
  * @returns Configuration namespace {@link NamespaceInterface}.
  * @example const namespace = config.addNamespace("foo")
  */
  addNamespace(name: NamespaceInterface["name"]): NamespaceInterface
  /**
  * Returns a configuration namespace
  * @param name - Name of the namespace to return
  * @returns Configuration namespace {@link NamespaceInterface} or undefined.
  * @example const namespace = config.namespace("foo")
  */
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined
  /**
  * Returns a configuration option
  * @param name - Name of the option to return
  * @returns Configuration option {@link OptionInterface} or undefined.
  * @example const option = config.option("foo")
  */
  option(name: OptionInterface["name"]): OptionInterface | undefined
  /**
  * Adds a configuration option, or throw an error in case it already exists
  * @param optionProperties - Properties of the new option {@link OptionProperties}
  * @returns Configuration option {@link OptionInterface}
  * @example const option = config.addOption({ name: "foo", type: "number"})
  */
  addOption(optionProperties: OptionProperties): OptionInterface
  /**
  * Adds several configuration options, or throw an error in case any of them already exist
  * @param options - Array of option properties {@link OptionProperties}
  * @returns Array of configuration options {@link OptionInterface}
  * @example const [option1, option2] = config.addOption([{ name: "foo", type: "number"}, { name: "foo2", type: "string"}])
  */
  addOptions(options: OptionProperties[]): OptionInterface[]
  /** Returns current options values from all namespaces */
  value: ConfigObject
  /** Returns values assigned in programmatic configuration */
  programmaticLoadedValues: ConfigObject
  /** Returns values assigned in configuration files */
  fileLoadedValues: ConfigObject
  /** Returns values assigned in environment variables */
  envLoadedValues: ConfigObject
  /** Returns values assigned in arguments */
  argsLoadedValues: ConfigObject
  /** Returns the path of the configuration file loaded, or null in case no file was loaded */
  loadedFile: string | null
  /** Returns an array containing all current namespaces */
  namespaces: NamespaceInterface[]
  /** Returns an array containing all current options */
  options: OptionInterface[]
  /** Returns the root config interface */
  root: ConfigInterface
  /**
  * Set the value of the options using the values in the provided configuration object
  * @param configuration - Configuration object {@link ConfigObject}
  * @param options - Options to pass to the options set method  {@link SetMethodOptions}
  * @example config.set({ option1: 5, namespace1: { option2: "foo"}})
  */
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
