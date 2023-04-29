/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ConfigInterface, ConfigurationObject } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import type { Package } from "update-notifier";

import type { AlertsInterface } from "./alerts/Alerts.types";
import type { FilesInterface } from "./files/Files.types";
import type { MockInterface } from "./mock/Mock.types";
import type { ServerInterface } from "./server/Server.types";
import type { VariantHandlersInterface } from "./variant-handlers/VariantHandlers.types";

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
  /** Alerts */
  get alerts(): AlertsInterface;

  /** Config */
  get config(): ConfigInterface;

  /** Logger */
  get logger(): LoggerInterface;

  /** Allows to initialize the core passing custom programmatic options.
   * @deprecated The method should not be used. It will be removed in next major version.
   * @param config - Programmatic configuration {@link ConfigurationObject}
   * @example await core.init({ log: "error" });
   */
  init(programmaticConfig: ConfigurationObject): Promise<void>;
}
