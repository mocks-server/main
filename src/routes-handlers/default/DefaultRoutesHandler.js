/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { isFunction } = require("lodash");

const FUNCTION = "function";

class DefaultRoutesHandler {
  static get id() {
    return "default";
  }

  static get validationSchema() {
    return {
      type: "object",
      properties: {
        response: {
          oneOf: [
            {
              type: "object",
              properties: {
                headers: {
                  type: "object",
                  errorMessage: 'Property "response.headers" should be an object',
                },
              },
              required: ["status"],
              errorMessage: {
                required: {
                  status: 'Should have an integer property "response.status"',
                },
              },
            },
            {
              instanceof: "Function",
            },
          ],
          errorMessage: 'Property "response" should be a valid object or a function',
        },
      },
      required: ["response"],
      errorMessage: {
        type: "Should be an object",
        required: {
          response: 'Should have a property "response"',
        },
      },
    };
  }

  constructor(route, core) {
    this._response = route.response;
    this._variantId = route.variantId;
    this._core = core;
  }

  middleware(req, res, next) {
    this._core.tracer.info(`Request ${req.method} => ${req.url} => "${this._variantId}"`);
    if (isFunction(this._response)) {
      this._core.tracer.debug(
        `Route variant "${this._variantId}" response is a function, executing middleware | req: ${req.id}`
      );
      this._response(req, res, next, this._core);
    } else {
      this._core.tracer.debug(
        `Responding with route variant "${this._variantId}" | req: ${req.id}`
      );
      if (this._response.headers) {
        res.set(this._response.headers);
      }
      res.status(this._response.status);
      res.send(this._response.body);
    }
  }

  get plainResponsePreview() {
    return isFunction(this._response)
      ? FUNCTION
      : {
          body: this._response.body,
          status: this._response.status,
        };
  }
}

module.exports = DefaultRoutesHandler;
