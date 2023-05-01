/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { AlertsInterface } from "../alerts/Alerts.types";

import type {
  FilesLoaderConstructor,
  FilesLoaderInterface,
  FilesLoaderOptions,
  FilesLoaderId,
  FilesLoaderOnLoadMethod,
  FilesLoaded,
  ErrorsLoadingFiles,
} from "./FilesLoader.types";

export const FilesLoader: FilesLoaderConstructor = class FilesLoader
  implements FilesLoaderInterface
{
  private _id: FilesLoaderId;
  private _logger: LoggerInterface;
  private _alerts: AlertsInterface;
  private _src: FilesLoaderOptions["src"];
  private _onLoad: FilesLoaderOnLoadMethod;

  constructor({ id, alerts, logger, src, onLoad }: FilesLoaderOptions) {
    this._id = id;
    this._logger = logger;
    this._alerts = alerts;
    this._src = src;
    this._onLoad = onLoad;
  }

  public load(filesContents: FilesLoaded, fileErrors: ErrorsLoadingFiles) {
    return this._onLoad(filesContents, fileErrors, {
      alerts: this._alerts,
      logger: this._logger,
    });
  }

  public get id() {
    return this._id;
  }

  public get src() {
    return this._src;
  }
};
