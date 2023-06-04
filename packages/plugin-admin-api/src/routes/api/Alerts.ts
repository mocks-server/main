/*
Copyright 2020-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import { Router } from "express";

import { addCollectionMiddleware, addModelMiddleware } from "../../support/Middlewares";

import type { AlertsOptions, AlertsConstructor, AlertsInterface, AlertItem } from "./Alerts.types";

export const Alerts: AlertsConstructor = class Alerts implements AlertsInterface {
  private _alerts: ScopedCoreInterface["alerts"];
  private _logger: ScopedCoreInterface["logger"];
  private _router: Router;

  constructor({ logger, alerts }: AlertsOptions) {
    this._alerts = alerts;
    this._logger = logger;
    this._router = Router();
    addCollectionMiddleware(this._router, {
      name: "alerts",
      getItems: this._parseCollection.bind(this),
      logger: this._logger.namespace("alerts"),
    });
    addModelMiddleware(this._router, {
      name: "alert",
      getItems: this._getCollection.bind(this),
      parseItem: this._parseModel.bind(this),
      logger: this._logger.namespace("alert"),
    });
  }

  public get router() {
    return this._router;
  }

  private _parseModel(alert: ScopedCoreInterface["alerts"]["root"]["flat"][0]): AlertItem {
    return {
      id: alert.id as string,
      message: alert.message,
      error: alert.error
        ? {
            name: alert.error.name,
            message: alert.error.message,
            stack: alert.error.stack,
          }
        : null,
    };
  }

  private _parseCollection() {
    return this._alerts.root.flat.map(this._parseModel.bind(this));
  }

  private _getCollection() {
    return this._alerts.root.flat.map((alert) => ({
      ...alert,
      id: alert.id as string,
    }));
  }
};
