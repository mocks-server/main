/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import { Router } from "express";
import type { Response } from "express";

import { readPackageVersion } from "../../common/Helpers";
import type { RequestWithId } from "../../server/Server.types";

import type { AboutInterface, AboutOptions, AboutConstructor } from "./About.types";

export const About: AboutConstructor = class About implements AboutInterface {
  private _version: string;
  private _coreVersion: string;
  private _logger: ScopedCoreInterface["logger"];
  private _router: Router;

  constructor({ logger, coreVersion }: AboutOptions) {
    this._version = readPackageVersion();
    this._coreVersion = coreVersion;
    this._logger = logger;
    this._router = Router();
    this._router.get("/", this._getAbout.bind(this));
  }

  public get router() {
    return this._router;
  }

  private _getAbout(req: RequestWithId, res: Response): void {
    this._logger.verbose(`Sending about | ${req.id}`);
    res.status(200);
    res.send({
      versions: {
        adminApi: this._version,
        core: this._coreVersion,
      },
    });
  }
};
