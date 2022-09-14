/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const path = require("path");

const DEFAULT_EXPRESS_OPTIONS = {
  root: path.resolve(process.cwd()),
};

class File {
  static get id() {
    return "file";
  }

  static get validationSchema() {
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

  constructor(options, core) {
    this._options = options;
    this._expressOptions = { ...DEFAULT_EXPRESS_OPTIONS, ...this._options.options };
    this._absPath = path.resolve(this._expressOptions.root, this._options.path);
    this._logger = core.logger;
    this._core = core;
  }

  middleware(req, res, next) {
    if (this._options.headers) {
      this._logger.debug(`Setting headers | req: ${req.id}`);
      res.set(this._options.headers);
    }
    res.status(this._options.status);
    this._logger.verbose(`Sending file '${this._absPath}' | req: ${req.id}`);
    res.sendFile(this._options.path, this._expressOptions, (err) => {
      if (err) {
        this._logger.error(
          `Error sending file '${this._absPath}' | req: ${req.id} | Error: ${err.message}`
        );
        next(err);
      }
    });
  }

  get preview() {
    return {
      status: this._options.status,
    };
  }
}

module.exports = File;
