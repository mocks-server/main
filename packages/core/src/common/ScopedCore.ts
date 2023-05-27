/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ConfigNamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/types";
import type { CoreInterface } from "../Core.types";
import type { FilesInterface } from "../files/types";
import type { MockInterface } from "../mock/types";
import type { ServerInterface } from "../server/types";
import type { VariantHandlersInterface } from "../variant-handlers/types";

import type {
  ScopedCoreInterface,
  ScopedCoreConstructor,
  ScopedCoreOptions,
} from "./ScopedCore.types";

export const ScopedCore: ScopedCoreConstructor = class ScopedCore implements ScopedCoreInterface {
  private _core: CoreInterface;
  private _alerts: AlertsInterface;
  private _config: ConfigNamespaceInterface;
  private _logger: LoggerInterface;

  constructor({ core, config, alerts, logger }: ScopedCoreOptions) {
    this._core = core;

    this._config = config;
    this._alerts = alerts;
    this._logger = logger;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  public get alerts(): AlertsInterface {
    return this._alerts;
  }

  public get config(): ConfigNamespaceInterface {
    return this._config;
  }

  public get files(): FilesInterface {
    return this._core.files;
  }

  public get logger(): LoggerInterface {
    return this._logger;
  }

  public get mock(): MockInterface {
    return this._core.mock;
  }

  public get server(): ServerInterface {
    return this._core.server;
  }

  public get variantHandlers(): VariantHandlersInterface {
    return this._core.variantHandlers;
  }

  public get version(): string {
    return this._core.version;
  }

  public async start(): Promise<void> {
    return this._core.start();
  }

  public async stop(): Promise<void> {
    return this._core.stop();
  }
};
