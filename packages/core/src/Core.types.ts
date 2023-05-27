/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  ConfigInterface,
  ConfigurationObject,
  GetOptionValueTypeFromDefinition,
  OptionDefinition,
} from "@mocks-server/config";
import type { LoggerInterface, LogLevel } from "@mocks-server/logger";
import type { Package } from "update-notifier";

import type { AlertsInterface } from "./alerts/types";
import type { FilesInterface } from "./files/types";
import type { MockInterface } from "./mock/types";
import type { ServerInterface } from "./server/types";
import type { VariantHandlersInterface } from "./variant-handlers/types";

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    //eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Config extends ConfigurationObject {}
  }
}

export type LogOptionDefinition = OptionDefinition<string, { hasDefault: true }>;

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface Config {
      log?: GetOptionValueTypeFromDefinition<LogOptionDefinition, LogLevel>;
    }
  }
}

/** Mocks-server base core interface */
export interface BaseCoreInterface {
  /** Files */
  get files(): FilesInterface;

  /** Mock */
  get mock(): MockInterface;

  /** Server */
  get server(): ServerInterface;

  /** Variant Handlers */
  get variantHandlers(): VariantHandlersInterface;

  /** Version */
  get version(): string;

  /** Start the mock server, files loaders and plugins */
  start(): Promise<void>;

  /** Stop the mock server, files loaders and plugins */
  stop(): Promise<void>;
}

// TODO, define the configuration object strictly. Allow plugins to add their own configuration

export interface CoreAdvancedOptions {
  /** Package.json object */
  pkg?: Package;
}

/**  Mocks-server core constructor */
export interface CoreConstructor {
  /**
   * Creates a Mocks Server core interface
   * @param config - Programmatic configuration {@link ConfigurationObject}
   * @param advancedOptions - Advanced options {@link AdvancedOptions}
   * @returns Mocks Server core interface {@link CoreInterface}.
   * @example const core = new Core({ log: "error" }, { pkg: { version: "1.2.0" }});
   */
  new (
    programmaticConfig?: ConfigurationObject,
    advancedOptions?: CoreAdvancedOptions
  ): CoreInterface;
}

/** Mocks-server base core interface */
export interface CoreInterface extends BaseCoreInterface {
  /** Alerts interface */
  get alerts(): AlertsInterface;

  /** Config interface */
  get config(): ConfigInterface;

  /** Logger interface */
  get logger(): LoggerInterface;

  /** Server interface */
  get server(): ServerInterface;

  /** Mock interface */
  get mock(): MockInterface;

  /** Variant handlers interface */
  get variantHandlers(): VariantHandlersInterface;

  /** Files interface */
  get files(): FilesInterface;

  /** Version */
  get version(): string;

  /** Allows to initialize manually the core. It is automatically called when calling start method
   * @example await core.init();
   */
  init(): Promise<void>;

  /** Start the files handler and the mock server */
  start(): Promise<void>;

  /** Stop the files handler and the mock server */
  start(): Promise<void>;
}
