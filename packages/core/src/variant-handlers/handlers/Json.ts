/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type { UnknownObject } from "../../common/Common.types";
import type { ScopedCoreInterface } from "../../common/ScopedCore.types";
import type { JSONSchema7WithInstanceof } from "../../mock/Validations.types";
import type { Request, Response } from "../../server/Server.types";

import type {
  VariantHandlerJsonConstructor,
  VariantHandlerJsonInterface,
  VariantHandlerJsonOptions,
  VariantHandlerJsonPreview,
} from "./Json.types";

export const VariantHandlerJson: VariantHandlerJsonConstructor = class VariantHandlerJson
  implements VariantHandlerJsonInterface
{
  private _options: VariantHandlerJsonOptions;
  private _logger: LoggerInterface;

  static get id(): string {
    return "json";
  }

  static get validationSchema(): JSONSchema7WithInstanceof {
    return {
      type: "object",
      properties: {
        headers: {
          type: "object",
        },
        status: {
          type: "number",
        },
        body: {
          oneOf: [
            {
              type: "boolean",
            },
            {
              type: "null",
            },
            {
              type: "number",
            },
            {
              type: "object",
            },
            {
              type: "array",
            },
          ],
        },
      },
      required: ["status", "body"],
      additionalProperties: false,
    };
  }

  constructor(options: VariantHandlerJsonOptions, core: ScopedCoreInterface) {
    this._options = options;
    this._logger = core.logger as LoggerInterface; // TODO, remove cast when plugin id is required
  }

  public get defaultHeaders(): UnknownObject {
    return {
      "Content-Type": "application/json; charset=utf-8",
    };
  }

  public middleware(req: Request, res: Response): void {
    this._logger.debug(`Setting headers | req: ${req.id}`);
    res.set({ ...this.defaultHeaders, ...this._options.headers });
    res.status(this._options.status);
    this._logger.verbose(`Sending response | req: ${req.id}`);
    res.send(this._options.body);
  }

  public get preview(): VariantHandlerJsonPreview {
    return {
      body: this._options.body,
      status: this._options.status,
    };
  }
};
