/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { NamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/Alerts.types";
import type { CoreInterface } from "../Core.types";

import type {
  ScopedCoreInterface,
  ScopedCoreConstructor,
  ScopedCoreOptions,
} from "./ScopedCore.types";

export const ScopedCore: ScopedCoreConstructor = class ScopedCore implements ScopedCoreInterface {
  private _core: CoreInterface;
  private _alerts: AlertsInterface;
  private _config: NamespaceInterface;
  private _logger: LoggerInterface;

  constructor({ core, config, alerts, logger }: ScopedCoreOptions) {
    this._core = core;

    this._config = config;
    this._alerts = alerts;
    this._logger = logger;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  get alerts() {
    return this._alerts;
  }

  get config() {
    return this._config;
  }

  get files() {
    return this._core.files;
  }

  get logger() {
    return this._logger;
  }

  get mock() {
    return this._core.mock;
  }

  get server() {
    return this._core.server;
  }

  get variantHandlers() {
    return this._core.variantHandlers;
  }

  get version() {
    return this._core.version;
  }

  async start() {
    return this._core.start();
  }

  async stop() {
    return this._core.stop();
  }
};
