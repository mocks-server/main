/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { ScopedCoreInterface } from "../../common/types";
import type { JSONSchema7WithInstanceof } from "../../mock/types";
import type { NextFunction, Request, Response } from "../../server/types";

import type {
  VariantHandlerMiddlewareConstructor,
  VariantHandlerMiddlewareInterface,
  VariantHandlerMiddlewareOptions,
  VariantHandlerMiddlewarePreview,
} from "./Middleware.types";

export const VariantHandlerMiddleware: VariantHandlerMiddlewareConstructor = class VariantHandlerMiddleware
  implements VariantHandlerMiddlewareInterface
{
  private _options: VariantHandlerMiddlewareOptions;
  private _logger: LoggerInterface;
  private _core: ScopedCoreInterface;

  constructor(options: VariantHandlerMiddlewareOptions, core: ScopedCoreInterface) {
    this._options = options;
    this._logger = core.logger;
    this._core = core;
  }

  public static get id(): string {
    return "middleware";
  }

  public static get validationSchema(): JSONSchema7WithInstanceof {
    return {
      type: "object",
      properties: {
        middleware: {
          instanceof: "Function",
        },
      },
      required: ["middleware"],
      additionalProperties: false,
    };
  }

  public get preview(): VariantHandlerMiddlewarePreview {
    return null;
  }

  public middleware(req: Request, res: Response, next: NextFunction): void {
    this._logger.verbose(`Executing middleware | req: ${req.id}`);
    this._options.middleware(req, res, next, this._core);
  }
};
