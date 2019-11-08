/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

const tracer = require("../common/tracer");

class SettingsApi {
  constructor(settings) {
    this._settings = settings;
    this._router = express.Router();
    this._router.put("/", this.put.bind(this));
    this._router.get("/", this.get.bind(this));
  }

  put(req, res) {
    const newDelay = req.body.delay;
    tracer.verbose(`Changing delay to "${newDelay}" | ${req.id}`);
    this._settings.delay = newDelay;
    this.get(req, res);
  }

  get(req, res) {
    tracer.verbose(`Sending delay to | ${req.id}`);
    res.status(200);
    res.send({
      delay: this._settings.delay
    });
  }

  get router() {
    return this._router;
  }
}

module.exports = SettingsApi;
