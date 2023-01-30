import type { JSONSchema7 } from "json-schema";

import type { ConfigurationObject, ObjectWithName } from "./CommonTypes";
import type { OptionInterface, SetMethodOptions, OptionProperties } from "./OptionTypes";
import type { ConfigValidationResult } from "./ValidationTypes";

/** Properties for creating a new config interface */
export interface ConfigOptions {
  /** Name for the config interface. It will be used as a prefix in configuration files and environment variables */
  moduleName: string;
  /** Determines whether arrays in configuration values should be merged with values defined in other sources or not */
  mergeArrays?: boolean;
}

/** Creates a configuration interface */
export interface ConfigConstructor {
  /**
   * Creates a configuration interface
   * @param option - Config options {@link ConfigOptions}
   * @returns Config interface {@link ConfigInterface}.
   * @example const config = new Config({ moduleName: "my-config" })
   */
  new (option: ConfigOptions): ConfigInterface;
}

/** Validation options */
export interface ConfigValidationOptions {
  /** Ignore additional properties during validation */
  allowAdditionalProperties?: boolean;
}

export type ConfigValidationSchema = JSONSchema7;

export interface LoadArgumentsOptions {
  allowUnknown: boolean;
}

/** Root config interface */
export interface ConfigInterface {
  /**
   * Validates a provided object based on current configuration and namespaces options
   * @param config - Configuration object to validate {@link ConfigurationObject}
   * @param options - Validation options {@link ConfigValidationOptions}
   * @returns Validation result {@link ConfigValidationResult}.
   * @example config.validate({ option1: "foo", namespace: { option2: 3 } }, { allowAdditionalProperties: false })
   */
  validate(config: ConfigurationObject, options?: ConfigValidationOptions): ConfigValidationResult;
  /**
   * Returns a Json schema based on current namespaces and options
   * @param options - Validation options {@link ConfigValidationOptions}
   * @returns Json schema {@link JSONSchema7}.
   * @example const schema = config.getValidationSchema({ allowAdditionalProperties: false })
   */
  getValidationSchema(options?: ConfigValidationOptions): ConfigValidationSchema;
  /**
   * Initializes the config object and loads the value of current namespaces and options, but doesn't perform validation, allowing to add more options based on the values of the previous ones.
   * @param programmaticConfig - Programmatic configuration object {@link ConfigurationObject}
   * @example await config.init({ option: "value" })
   */
  init(programmaticConfig?: ConfigurationObject): Promise<void>;
  /**
   * Loads values of all namespaces and options, and validates them.
   * @param programmaticConfig - Programmatic configuration object {@link ConfigurationObject}
   * @example await config.load({ option: "value" })
   */
  load(programmaticConfig?: ConfigurationObject): Promise<void>;
  /**
   * Adds a configuration namespace, or returns an existing one in case the name already exists
   * @param name - Name for the new namespace
   * @returns Configuration namespace {@link NamespaceInterface}.
   * @example const namespace = config.addNamespace("foo")
   */
  addNamespace(name: NamespaceInterface["name"]): NamespaceInterface;
  /**
   * Returns a configuration namespace
   * @param name - Name of the namespace to return
   * @returns Configuration namespace {@link NamespaceInterface}
   * @example const namespace = config.namespace("foo")
   */
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined;
  /**
   * Returns a configuration option
   * @param name - Name of the option to return
   * @returns Configuration option {@link OptionInterface} or undefined.
   * @example const option = config.option("foo")
   */
  option(name: OptionInterface["name"]): OptionInterface | undefined;
  /**
   * Adds a configuration option, or throw an error in case it already exists
   * @param optionProperties - Properties of the new option {@link OptionProperties}
   * @returns Configuration option {@link OptionInterface}
   * @example const option = config.addOption({ name: "foo", type: "number"})
   */
  addOption(optionProperties: OptionProperties): OptionInterface;
  /**
   * Adds several configuration options, or throw an error in case any of them already exist
   * @param options - Array of option properties {@link OptionProperties}
   * @returns Array of configuration options {@link OptionInterface}
   * @example const [option1, option2] = config.addOptions([{ name: "foo", type: "number"}, { name: "foo2", type: "string"}])
   */
  addOptions(options: OptionProperties[]): OptionInterface[];
  /** Returns current options values and values from all child namespaces */
  value: ConfigurationObject;
  /** Returns values assigned in programmatic configuration */
  programmaticLoadedValues: ConfigurationObject;
  /** Returns values assigned in configuration files */
  fileLoadedValues: ConfigurationObject;
  /** Returns values assigned in environment variables */
  envLoadedValues: ConfigurationObject;
  /** Returns values assigned in arguments */
  argsLoadedValues: ConfigurationObject;
  /** Returns the path of the configuration file loaded, or null in case no file was loaded */
  loadedFile: string | null;
  /** Returns an array containing all current namespaces */
  namespaces: NamespaceInterface[];
  /** Returns an array containing all current options */
  options: OptionInterface[];
  /** Returns the root config interface */
  root: ConfigInterface;
  /**
   * Set the value of the options, including child namespaces, using the values in the provided configuration object
   * @param configuration - Configuration object {@link ConfigurationObject}
   * @param options - Options to pass to the set method of the options interface {@link SetMethodOptions}
   * @example config.set({ option1: 5, namespace1: { option2: "foo"}})
   */
  set(configuration: ConfigurationObject, options?: SetMethodOptions): void;
}

/** Properties for creating a new namespace */
export interface NamespaceProperties {
  /** Array containing parent namespaces */
  parents?: NamespaceInterface[];
  /** Array containing brother namespaces */
  brothers: NamespaceInterface[];
  /** Root config interface */
  root: ConfigInterface;
  /** Is root namespace or not. Root namespace must be unique in a config interface and it delegates its options to it */
  isRoot?: true;
}

/** Creates a namespace */

export interface NamespaceConstructor {
  /**
   * Creates a namespace interface
   * @param name - Name for the namespace
   * @returns Config interface {@link NamespaceInterface}.
   * @example const namespace = new Namespace("foo", { root: config, brothers: [namespace_x, namespace_y], isRoot: true })
   */
  new (name: string, options?: NamespaceProperties): NamespaceInterface;
}

/** Config namespace */
export interface NamespaceInterface extends ObjectWithName {
  /** Array containing namespace options */
  options: OptionInterface[];
  /** Array containing child namespaces */
  namespaces: NamespaceInterface[];
  /** Array containing parent namespaces up to the root configuration */
  parents: NamespaceInterface[];
  /** Returns current options values and values from all child namespaces */
  value: ConfigurationObject;
  /** Returns the root config interface */
  root: ConfigInterface;
  /** Is root namespace or not. Root namespace is unique and it delegates its options to the config interface */
  isRoot: boolean;
  /** Namespace name */
  name: string;
  /**
   * Start emitting events
   * @example namespace.startEvents()
   */
  startEvents(): void;
  /**
   * Adds an option to the namespace, or throw an error in case it already exists
   * @param optionProperties - Properties of the new option {@link OptionProperties}
   * @returns Configuration option {@link OptionInterface}
   * @example const option = namespace.addOption({ name: "foo", type: "number"})
   */
  addOption(optionProperties: OptionProperties): OptionInterface;
  /**
   * Adds several namespace options, or throw an error in case any of them already exist
   * @param options - Array of option properties {@link OptionProperties}
   * @returns Array of options {@link OptionInterface}
   * @example const [option1, option2] = namespace.addOptions([{ name: "foo", type: "number"}, { name: "foo2", type: "string"}])
   */
  addOptions(options: OptionProperties[]): OptionInterface[];
  /**
   * Set the value of the options, including child namespaces, using the values in the provided configuration object
   * @param configuration - Configuration object {@link ConfigurationObject}
   * @param options - Options to pass to the set method of the options interface {@link SetMethodOptions}
   * @example namespace.set({ option1: 5, namespace1: { option2: "foo"}})
   */
  set(configuration: ConfigurationObject, options: SetMethodOptions): void;
  /**
   * Adds a child namespace, or returns an existing one in case the name already exists
   * @param name - Name for the new namespace
   * @returns Configuration namespace {@link NamespaceInterface}.
   * @example const child_namespace = namespace.addNamespace("foo")
   */
  addNamespace(name?: NamespaceInterface["name"]): NamespaceInterface;
  /**
   * Returns a child namespace
   * @param name - Name of the namespace to return
   * @returns Namespace {@link NamespaceInterface} or undefined.
   * @example const child_namespace = namespace.namespace("foo")
   */
  namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined;
  /**
   * Returns a namespace option
   * @param name - Name of the option to return
   * @returns Namespace option {@link OptionInterface} or undefined.
   * @example const option = namespace.option("foo")
   */
  option(name: OptionInterface["name"]): OptionInterface | undefined;
}
