import type { ConfigInterface, OptionValue, OptionDescription } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import type { CollectionInterface } from "@mocks-server/nested-collections";

export type ConfigVarName = string;
export type ConfigVarNameWithQuotes = `"${ConfigVarName}"`;

export type OptionScaffoldOmitProperty = "omit";
export type OptionScaffoldCommentedProperty = "commented";
export type OptionScaffoldValueProperty = "value";

export type ScaffoldOptionOmitted = boolean;
export type ScaffoldOptionCommented = boolean;

export interface OptionsScaffoldExtraData {
  /** Omit option from config scaffold */
  omit: ScaffoldOptionOmitted;
  /** Comment option in config scaffold */
  commented: ScaffoldOptionCommented;
  /** Value to be set in the config scaffold */
  value: unknown;
}

/** Option data prepared for templates */
export interface OptionTemplateData {
  /** Option name */
  name: ConfigVarName;
  /** Option value */
  value: OptionValue;
  /** Option description */
  description?: OptionDescription;
  /** Option is commented */
  commented: ScaffoldOptionCommented;
}

/** Namespace data prepared for templates */
export interface NamespaceTemplateData {
  /** Namespace name */
  name: ConfigVarName;
  /** Namespace options */
  options?: OptionTemplateData[];
  /** Namespace namespaces */
  namespaces?: NamespaceTemplateData[];
}

export interface ScaffoldOptions {
  /** Config */
  config: ConfigInterface;
  /** Alerts */
  alerts: CollectionInterface;
  /** Logger */
  logger: LoggerInterface;
}

/** Options for initializing the scaffold */
export interface ScaffoldInitOptions {
  /**
   * Path to the folder where the files will be generated
   */
  folderPath: string;
}

/** Creates a Scaffold interface */
export interface ScaffoldConstructor {
  /**
   * Scaffold static id
   */
  id: string;
  /**
   * Creates a scaffold interface
   * @param options - Scaffold options {@link ScaffoldOptions}
   * @returns Scaffold interface {@link ScaffoldInterface}.
   * @example const scaffold = new Scaffold({ config,  });
   */
  new (options: ScaffoldOptions): ScaffoldInterface;
}

/** Scaffold interface */
export interface ScaffoldInterface {
  /**
   * Initializes the scaffold. Creates config files and example files
   * @example scaffold.init({ folderPath: "/path/to/folder" });
   */
  init(options: ScaffoldInitOptions): Promise<void>;
}
