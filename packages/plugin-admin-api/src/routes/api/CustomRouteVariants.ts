/*
Copyright 2020-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { badRequest } from "@hapi/boom";
import type { ScopedCoreInterface } from "@mocks-server/core";
import { Response, Router, NextFunction } from "express";

import type { RequestWithId } from "../../server/Server.types";
import { addCollectionMiddleware } from "../../support/Middlewares";

import type {
  CustomRouteVariantsConstructor,
  CustomRouteVariantsInterface,
  CustomRouteVariantsOptions,
} from "./CustomRouteVariants.types";

export const CustomRouteVariants: CustomRouteVariantsConstructor = class CustomRoutesVariants
  implements CustomRouteVariantsInterface
{
  private _mock: ScopedCoreInterface["mock"];
  private _logger: ScopedCoreInterface["logger"];
  private _router: Router;

  constructor({ logger, mock }: CustomRouteVariantsOptions) {
    this._mock = mock;
    this._logger = logger;
    this._router = Router();
    addCollectionMiddleware(this._router, {
      name: "custom route variants",
      getItems: this._getCollection.bind(this),
      logger: this._logger,
    });

    this._router.post("/", this._add.bind(this));
    this._router.delete("/", this._delete.bind(this));
  }

  _getCollection() {
    return this._mock.customRouteVariants.map((routeVariant) => ({
      id: routeVariant,
    }));
  }

  private _add(req: RequestWithId, res: Response, next: NextFunction) {
    const id = req.body.id;
    const routeVariant = this._mock.routes.plainVariants.find(
      (routeVariantCandidate) => routeVariantCandidate.id === id
    );
    if (routeVariant) {
      this._mock.useRouteVariant(id);
      res.status(204);
      res.send();
    } else {
      next(badRequest(`Route variant with id "${id}" was not found`));
    }
  }

  private _delete(_req: RequestWithId, res: Response) {
    this._mock.restoreRouteVariants();
    res.status(204);
    res.send();
  }

  public get router() {
    return this._router;
  }
};
