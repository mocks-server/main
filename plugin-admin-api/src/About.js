/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

const { PLUGIN_NAME } = require("./support/constants");
const { version } = require("../package.json");

class AboutApi {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
    this._router = express.Router();
    this._router.get("/", this.getAbout.bind(this));
  }

  getAbout(req, res) {
    this._tracer.verbose(`${PLUGIN_NAME}: Sending about | ${req.id}`);
    res.status(200);
    res.send({
      version,
    });
  }

  get router() {
    return this._router;
  }
}

module.exports = AboutApi;
