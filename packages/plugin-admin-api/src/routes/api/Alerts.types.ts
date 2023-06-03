/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Router } from "express";

import type { ApiEntityItem } from "../../common/Common.types";

/** Options for creating an Alerts interface */
export interface AlertsOptions {
  /** Logger */
  logger: ScopedCoreInterface["logger"];
  /** Mocks Server alerts interface */
  alerts: ScopedCoreInterface["alerts"];
}

/** Creates a Alerts interface */
export interface AlertsConstructor {
  /**
   * Creates a Alerts interface
   * @param options - Alerts options {@link AlertsOptions}
   * @returns Alerts interface {@link AlertsInterface}.
   * @example const AlertsInterface = new AlertsInterface({ logger, alerts });
   */
  new (options: AlertsOptions): AlertsInterface;
}

/** Alerts interface */
export interface AlertsInterface {
  /** Express router for the alerts path */
  get router(): Router;
}

/** Alert in the API response */
export interface AlertItem extends ApiEntityItem {
  /** Alert id */
  id: string;
  /** Alert message */
  message: string;
  /** Alert error */
  error: {
    name: string;
    message: string;
    stack?: string;
  } | null;
}
