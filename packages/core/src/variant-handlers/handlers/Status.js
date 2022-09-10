/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

class Status {
  static get id() {
    return "status";
  }

  get defaultHeaders() {
    return {
      "Content-Length": "0",
    };
  }

  static get validationSchema() {
    return {
      type: "object",
      properties: {
        headers: {
          type: "object",
        },
        status: {
          type: "number",
        },
      },
      required: ["status"],
      additionalProperties: false,
    };
  }

  constructor(options, core) {
    this._core = core;
    this._options = options;
    this._logger = core.logger;
  }

  middleware(req, res) {
    this._logger.debug(`Setting headers | req: ${req.id}`);
    res.set({ ...this.defaultHeaders, ...this._options.headers });
    res.status(this._options.status);
    this._logger.verbose(`Sending response with empty body | req: ${req.id}`);
    res.send();
  }

  get preview() {
    return {
      status: this._options.status,
    };
  }
}

module.exports = Status;
