/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

class Middleware {
  static get id() {
    return "middleware";
  }

  static get validationSchema() {
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

  constructor(options, core) {
    this._options = options;
    this._logger = core.logger;
    this._core = core;
  }

  middleware(req, res, next) {
    this._logger.verbose(`Executing middleware | req: ${req.id}`);
    this._options.middleware(req, res, next, this._core);
  }

  get preview() {
    return null;
  }
}

module.exports = Middleware;
