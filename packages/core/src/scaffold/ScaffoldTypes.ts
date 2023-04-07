/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

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
   * @example const scaffold = new Scaffold({ config, alerts, logger });
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
