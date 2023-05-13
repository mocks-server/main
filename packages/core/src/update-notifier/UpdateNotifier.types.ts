/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { Package } from "update-notifier";

import type { AlertsInterface } from "../alerts/Alerts.types";

export interface UpdateNotifierOptions {
  /** Alerts */
  alerts: AlertsInterface;
  /** Package info */
  pkg?: Package;
}

/** Creates an Update notifier interface */
export interface UpdateNotifierConstructor {
  /**
   * Static id
   */
  id: string;
  /**
   * Creates an UpdateNotifier interface
   * @param options - Update notifier options {@link UpdateNotifierOptions}
   * @returns UpdateNotifier interface {@link UpdateNotifierInterface}.
   * @example const updateNotifier = new UpdateNotifier({ alerts, pkg });
   */
  new (options: UpdateNotifierOptions): UpdateNotifierInterface;
}

/** Update notifier interface */
export interface UpdateNotifierInterface {
  /**
   * Initializes the update notifier. Checks for updates and shows a message if there is a new version available
   * @example updateNotifier.init();
   */
  init(): void;
}
