/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { badRequest } from "@hapi/boom";
import type { ScopedCoreInterface } from "@mocks-server/core";
import { NextFunction, Response, Router } from "express";

import type { RequestWithId } from "../../server/Server.types";

import type { ConfigOptions, ConfigConstructor, ConfigInterface } from "./Config.types";

export const Config: ConfigConstructor = class Config implements ConfigInterface {
  private _logger: ScopedCoreInterface["logger"];
  private _config: ScopedCoreInterface["config"]["root"];
  private _router: Router;

  constructor({ logger, config }: ConfigOptions) {
    this._logger = logger;
    this._config = config.root;
    this._router = Router();
    this._router.patch("/", this._patch.bind(this));
    this._router.get("/", this._get.bind(this));
  }

  private _validateNewConfig(newConfig: MocksServer.Config) {
    return this._config.validate(newConfig);
  }

  private _patch(req: RequestWithId, res: Response, next: NextFunction) {
    const newConfig = req.body;
    const { valid, errors } = this._validateNewConfig(newConfig);
    if (!valid && errors?.length) {
      next(badRequest(JSON.stringify(errors)));
    } else {
      this._config.set(newConfig);
      res.status(204);
      res.send();
    }
  }

  private _get(req: RequestWithId, res: Response) {
    this._logger.verbose(`Sending settings | ${req.id}`);
    res.status(200);
    res.send(this._config.value);
  }

  public get router() {
    return this._router;
  }
};
