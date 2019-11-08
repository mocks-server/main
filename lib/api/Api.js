/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

const Features = require("./Features");
const Settings = require("./Settings");

const FEATURES_PATH = "/features";

class Api {
  constructor(features, settings) {
    const featuresRouter = new Features(features).router;
    this._features = features;
    this._router = express.Router();
    this._router.use(FEATURES_PATH, (req, res, next) => {
      tracer.warning(`"${FEATURES_PATH}" api path will be deprecated. Use "/behaviors" instead`);
      next();
    });
    this._router.use(FEATURES_PATH, featuresRouter);
    this._router.use("/behaviors", featuresRouter);
    this._router.use("/settings", new Settings(settings).router);
  }

  get router() {
    return this._router;
  }
}

module.exports = Api;
