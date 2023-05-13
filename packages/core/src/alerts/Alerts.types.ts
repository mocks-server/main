/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";
import type {
  BaseNestedCollections,
  CollectionId,
  CollectionItem,
  CollectionOptions,
} from "@mocks-server/nested-collections";

export type AlertMessage = string;
export type AlertError = Error;
export type AlertId = CollectionId;
export type Alert = CollectionItem;
export type AlertsId = string;

export interface AlertValue {
  /** Alert message */
  message: AlertMessage;
  /** Alert error */
  error?: AlertError;
}

export interface AlertFlat extends AlertValue {
  /** Alert id */
  id: AlertId;
}

export type AlertsFlat = AlertFlat[];

export interface AlertsOptions extends CollectionOptions {
  /** Logger */
  logger: LoggerInterface;
}

/** Creates an Alerts interface */
export interface AlertsConstructorInterface {
  /**
   * Creates an Alerts interface
   * @param id - Id for the alerts collection
   * @returns Alerts interface {@link AlertsInterface}.
   * @example const alerts = new Alerts("foo", { logger });
   */
  new (id: AlertsId, options?: AlertsOptions): AlertsInterface;
}

/** Alerts interface */
export interface AlertsInterface extends BaseNestedCollections {
  /**
   * Set an alert. If an alert with the same id already exists, it will be replaced
   * @param id - Alert id {@link AlertId}.
   * @param message - Alert message {@link AlertMessage}.
   * @param error - Alert error {@link AlertError}.
   * @example alerts.set("foo", "Foo alert", new Error("Foo alert error")));
   */
  set(id: AlertId, message: AlertMessage, error?: AlertError): Alert;

  /**
   * Removes an alert.
   * @param id - Alert id {@link AlertId}.
   * @example alerts.remove("foo");
   */
  remove(id: AlertId): void;

  /** All collection items and children collection items in a flat array **/
  get flat(): AlertsFlat;
}
