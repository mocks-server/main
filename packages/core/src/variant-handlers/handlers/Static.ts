/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";
import { static as expressStatic } from "express";
import type { ServeStaticOptions } from "serve-static";

import type { ScopedCoreInterface } from "../../common/ScopedCore.types";
import type { JSONSchema7WithInstanceof } from "../../mock/Validations.types";
import type { RequestHandler, Response } from "../../server/Server.types";

import type {
  VariantHandlerStaticConstructor,
  VariantHandlerStaticInterface,
  VariantHandlerStaticOptions,
  VariantHandlerStaticPreview,
} from "./Static.types";

export const VariantHandlerStatic: VariantHandlerStaticConstructor = class VariantHandlerStatic
  implements VariantHandlerStaticInterface
{
  private _options: VariantHandlerStaticOptions;
  private _logger: LoggerInterface;
  private _expressStaticOptions: ServeStaticOptions;

  static get id(): string {
    return "static";
  }

  static get validationSchema(): JSONSchema7WithInstanceof {
    return {
      type: "object",
      properties: {
        path: {
          type: "string",
        },
        headers: {
          type: "object",
        },
        options: {
          type: "object",
        },
      },
      required: ["path"],
      additionalProperties: false,
    };
  }

  constructor(options: VariantHandlerStaticOptions, core: ScopedCoreInterface) {
    this._options = options;
    this._expressStaticOptions = this._options.options || {};
    this._logger = core.logger as LoggerInterface;
  }

  public get router(): RequestHandler {
    this._logger.verbose(`Creating router to serve static folder ${this._options.path}`);

    let setHeadersOption;
    if (this._options.headers) {
      setHeadersOption = (res: Response): void => {
        res.set(this._options.headers);
      };
    }

    return expressStatic(this._options.path, {
      ...this._expressStaticOptions,
      setHeaders: this._expressStaticOptions.setHeaders || setHeadersOption,
    });
  }

  public get preview(): VariantHandlerStaticPreview {
    return null;
  }
};
