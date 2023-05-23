/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import type { LoggerInterface } from "@mocks-server/logger";

import type { ScopedCoreInterface } from "../../common/types";
import type { JSONSchema7WithInstanceof } from "../../mock/types";
import type { NextFunction, Request, Response } from "../../server/types";

import type {
  VariantHandlerFileConstructor,
  VariantHandlerFileInterface,
  VariantHandlerFileOptions,
  VariantHandlerFilePreview,
  VariantHandlerFileOptionsExpressWithRoot,
} from "./File.types";

const DEFAULT_EXPRESS_OPTIONS = {
  root: path.resolve(process.cwd()),
};

export const VariantHandlerFile: VariantHandlerFileConstructor = class VariantHandlerFile
  implements VariantHandlerFileInterface
{
  private _options: VariantHandlerFileOptions;
  private _absPath: string;
  private _logger: LoggerInterface;
  private _expressOptions: VariantHandlerFileOptionsExpressWithRoot;

  static get id(): string {
    return "file";
  }

  static get validationSchema(): JSONSchema7WithInstanceof {
    return {
      type: "object",
      properties: {
        path: {
          type: "string",
        },
        status: {
          type: "number",
        },
        headers: {
          type: "object",
        },
        options: {
          type: "object",
        },
      },
      required: ["status", "path"],
      additionalProperties: false,
    };
  }

  constructor(options: VariantHandlerFileOptions, core: ScopedCoreInterface) {
    this._options = options;
    this._expressOptions = { ...DEFAULT_EXPRESS_OPTIONS, ...this._options.options };
    this._absPath = path.resolve(this._expressOptions.root, this._options.path);
    this._logger = core.logger as LoggerInterface;
  }

  public middleware(req: Request, res: Response, next: NextFunction): void {
    if (this._options.headers) {
      this._logger.debug(`Setting headers | req: ${req.id}`);
      res.set(this._options.headers);
    }
    res.status(this._options.status);
    this._logger.verbose(`Sending file '${this._absPath}' | req: ${req.id}`);
    res.sendFile(this._options.path, this._expressOptions, (err?: Error): void => {
      if (err) {
        this._logger.error(
          `Error sending file '${this._absPath}' | req: ${req.id} | Error: ${err.message}`
        );
        next(err);
      }
    });
  }

  public get preview(): VariantHandlerFilePreview {
    return {
      status: this._options.status,
    };
  }
};
