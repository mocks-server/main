/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

class Static {
  static get id() {
    return "static";
  }

  static get validationSchema() {
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

  constructor(options, core) {
    this._options = options;
    this._expressStaticOptions = this._options.options || {};
    this._logger = core.logger;
    this._core = core;
  }

  get router() {
    this._logger.verbose(`Creating router to serve static folder ${this._options.path}`);

    let setHeadersOption;
    if (this._options.headers) {
      setHeadersOption = (res) => {
        res.set(this._options.headers);
      };
    }
    return express.static(this._options.path, {
      ...this._expressStaticOptions,
      setHeaders: this._expressStaticOptions.setHeaders || setHeadersOption,
    });
  }
}

module.exports = Static;
