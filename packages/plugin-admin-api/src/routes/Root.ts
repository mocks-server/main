/*
Copyright 2022-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import { static as expressStatic, Router } from "express";
import type { Request, Response } from "express";

import { ROOT_PATH } from "../common/Paths";

import type { RootConstructor, RootInterface, RootOptions } from "./Root.types";

export const Root: RootConstructor = class Root implements RootInterface {
  private _router: Router;

  constructor({ redirectUrl }: RootOptions) {
    this._router = Router();
    this._router.use(expressStatic(path.resolve(ROOT_PATH, "static", "root")));
    const redirect = (_req: Request, res: Response): void => {
      res.redirect(redirectUrl);
    };
    this._router.get("/", redirect);
    this._router.get("/index.html", redirect);
    this._router.get("/index.htm", redirect);
  }

  public get router() {
    return this._router;
  }
};
