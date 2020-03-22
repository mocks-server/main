/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const routeParser = require("route-parser");
const md5 = require("md5");

const isFunction = (response) => {
  return typeof response === "function";
};

class Fixture {
  static recognize(fixture) {
    if (
      fixture &&
      fixture.url &&
      fixture.method &&
      fixture.response &&
      (isFunction(fixture.response) || fixture.response.status)
    ) {
      return true;
    }
    return false;
  }

  static get displayName() {
    return "mocks-server-fixture";
  }

  constructor(fixture) {
    this._method = fixture.method;
    this._url = fixture.url;
    this._response = fixture.response;
    this._route = routeParser(fixture.url);
    this._id = fixture.id || this._getId();
    this._requestMatchId = this._getRequestMatchId();
    this._responsePreview = isFunction(this._response)
      ? {
          type: "dynamic",
          function: this._response.toString(),
        }
      : {
          type: "static",
          ...this._response,
        };
  }

  _getRequestMatchId() {
    return md5(`${this._method}-${this._url}`);
  }

  _getId() {
    return md5(
      `${this._method}-${this._url}-${
        isFunction(this._response) ? this._response.toString() : JSON.stringify(this._response)
      }`
    );
  }

  requestMatch(req) {
    return req.method === this._method && this._route.match(req.url);
  }

  handleRequest(req, res, next, core) {
    if (isFunction(this._response)) {
      core.tracer.debug(
        `Fixture ${this.id} response is a function, executing response | req: ${req.id}`
      );
      req.params = this._route.match(req.url);
      this._response(req, res, next);
    } else {
      core.tracer.debug(`Sending fixture ${this.id} | req: ${req.id}`);
      res.status(this._response.status);
      res.send(this._response.body);
    }
  }

  get requestMatchId() {
    return this._requestMatchId;
  }

  get id() {
    return this._id;
  }

  get request() {
    return {
      url: this._url,
      method: this._method,
    };
  }

  get response() {
    return this._responsePreview;
  }
}

module.exports = Fixture;
