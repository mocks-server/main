/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

class CustomRoutesHandler {
  static get id() {
    return "custom";
  }

  static get version() {
    return "4";
  }

  constructor(response, core) {
    this._response = response;
    this._core = core;
  }

  middleware(req, res) {
    this._core.logger.info(`Custom request ${req.method} => ${req.url}`);
    res.status(this._response.status);
    res.send(this._response.body);
  }

  get preview() {
    return {
      body: this._response.body,
      status: this._response.status,
    };
  }
}

module.exports = CustomRoutesHandler;
