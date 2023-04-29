/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/Alerts.types";
import type { BaseCoreInterface, CoreInterface } from "../Core.types";

/** Objects allowing to create a scoped core */
export interface ScopedCoreOptions {
  /** Mocks Server root core instance */
  core: CoreInterface;
  /** Namespace of the root core config object. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance */
  config?: NamespaceInterface;
  /** Namespace, or scoped child collection of the root core alerts. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance */
  alerts?: AlertsInterface;
  /** Namespace of the root core logger. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance */
  logger?: LoggerInterface;
}

/**  Mocks-server scoped core constructor */
export interface ScopedCoreConstructor {
  /**
   * Creates a Mocks Server core interface, with scoped alerts, config and logger
   * @param core - Mocks server root core {@link CoreInterface}
   * @param options - Advanced options {@link ScopedCoreOptions}
   * @returns Mocks Server scoped core interface {@link ScopedCoreInterface}.
   * @example const scopedCore = new ScopedCore({ core, config, alerts, logger });
   */
  new (options: ScopedCoreOptions): ScopedCoreInterface;
}

/** Mocks Server Core interface, but containing scoped alerts, config and logger */
export interface ScopedCoreInterface extends BaseCoreInterface {
  /** Namespace of the root core config object. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance*/
  config?: NamespaceInterface;
  /** Namespace, or scoped child collection of the root core alerts. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance*/
  alerts?: AlertsInterface;
  /** Namespace of the root core logger. It may be undefined when scoped core is created for a plugin, and its constructor has no static id nor id getter in instance*/
  logger?: LoggerInterface;
}
