/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";

import type {
  VariantHandlerTextConstructor,
  VariantHandlerTextInterface,
  VariantHandlerTextOptions,
  VariantHandlerTextPreview,
} from "./TextTypes";

import type { UnknownObject } from "../../common/CommonTypes";
import type { CoreInterface } from "../../CoreTypes";
import type { JSONSchema7WithInstanceof } from "../../mock/ValidationsTypes";
import type { Request, Response } from "../../server/ServerTypes";

export const VariantHandlerText: VariantHandlerTextConstructor = class VariantHandlerText
  implements VariantHandlerTextInterface
{
  private _options: VariantHandlerTextOptions;
  private _logger: LoggerInterface;

  static get id() {
    return "text";
  }

  get defaultHeaders(): UnknownObject {
    return {
      "Content-Type": "text/plain; charset=utf-8",
    };
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
          type: "string",
        },
      },
      required: ["status", "body"],
      additionalProperties: false,
    };
  }

  constructor(options: VariantHandlerTextOptions, core: CoreInterface) {
    this._options = options;
    this._logger = core.logger;
  }

  middleware(req: Request, res: Response): void {
    this._logger.debug(`Setting headers | req: ${req.id}`);
    res.set({ ...this.defaultHeaders, ...this._options.headers });
    res.status(this._options.status);
    this._logger.verbose(`Sending response | req: ${req.id}`);
    res.send(this._options.body);
  }

  get preview(): VariantHandlerTextPreview {
    return {
      body: this._options.body,
      status: this._options.status,
    };
  }
};
