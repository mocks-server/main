/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import EventEmitter from "events";

import type { ConfigNamespaceInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import express from "express";

import type { AlertsInterface } from "../alerts/types";
import { addEventListener, CHANGE_MOCK } from "../common";
import type { EventListener, EventListenerRemover } from "../common/types";
import type { NextFunction, Request, Response, Router } from "../server/types";
import type { VariantHandlerConstructor } from "../variant-handlers/types";

import type { CoreInterface } from "../Core.types";

import { Collections } from "./collections";
import type { CollectionsInterface } from "./collections/types";
import { Definitions } from "./definitions";
import type { DefinitionsInterface, DefinitionsLoaders } from "./definitions/types";
import { Routes } from "./routes";
import type { RouteId, RoutesInterface } from "./routes/types";

import type { MockInterface, MockConstructor, MockOptions } from "./Mock.types";

export const Mock: MockConstructor = class Mock implements MockInterface {
  private _eventEmitter: EventEmitter;
  private _alerts: AlertsInterface;
  private _logger: LoggerInterface;
  private _config: ConfigNamespaceInterface;
  private _onChange: EventListener;
  private _router: Router = express.Router();
  private _definitions: DefinitionsInterface;
  private _routes: RoutesInterface;
  private _collections: CollectionsInterface;
  private _variantHandlers: VariantHandlerConstructor[];

  constructor({ config, logger, onChange, alerts }: MockOptions, core: CoreInterface) {
    this._eventEmitter = new EventEmitter();

    this._alerts = alerts;
    this._logger = logger;
    this._config = config;
    this._onChange = onChange;

    this.router = this.router.bind(this);
    this._reloadRouter = this._reloadRouter.bind(this);

    this._definitions = new Definitions({
      onLoad: this._loadDefinitions.bind(this),
    });

    this._routes = new Routes(
      {
        alerts: this._alerts.collection(Routes.id),
        logger: this._logger.namespace(Routes.id),
        config: this._config.addNamespace(Routes.id),
        onChange: this._reloadRouter,
      },
      core
    );

    this._collections = new Collections({
      routesManager: this._routes,
      alerts: this._alerts.collection(Collections.id),
      logger: this._logger.namespace(Collections.id),
      config: this._config.addNamespace(Collections.id),
      onChange: this._reloadRouter,
    });
  }

  public static get id() {
    return "mock";
  }

  public get customRouteVariants(): RouteId[] {
    return this._collections.current?.customRouteIds || [];
  }

  public get routes(): RoutesInterface {
    return this._routes;
  }

  public get collections(): CollectionsInterface {
    return this._collections;
  }

  public get definitions(): DefinitionsInterface {
    return this._definitions;
  }

  public async init(variantHandlers: VariantHandlerConstructor[]): Promise<void> {
    this._variantHandlers = variantHandlers;
  }

  public router(req: Request, res: Response, next: NextFunction) {
    this._router(req, res, next);
  }

  public restoreRouteVariants(): void {
    this._collections.current?.resetRoutes();
  }

  public useRouteVariant(routeId: RouteId): void {
    this._collections.current?.useRoute(routeId);
  }

  public createLoaders(): DefinitionsLoaders {
    return this._definitions.createLoaders();
  }

  public onChange(listener: EventListener): EventListenerRemover {
    return addEventListener(listener, CHANGE_MOCK, this._eventEmitter);
  }

  private _emitChange(): void {
    this._eventEmitter.emit(CHANGE_MOCK);
    this._onChange();
  }

  private _reloadRouter(): void {
    if (this._collections.current) {
      this._router = this._collections.current.router;
    } else {
      this._router = express.Router();
    }
    this._emitChange();
  }

  private _loadDefinitions(): void {
    this._routes.load(this._definitions.routes.get(), this._variantHandlers);
    this._collections.load(this._definitions.collections.get());
  }
};
