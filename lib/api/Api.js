/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

const Behaviors = require("./Behaviors");
const Settings = require("./Settings");

const FEATURES_PATH = "/features";

class Api {
  constructor(core) {
    this._core = core;
    this._tracer = core.tracer;
  }

  init() {
    const behaviorsRouter = new Behaviors(this._core, this._tracer).router;
    this._router = express.Router();
    this._router.use(FEATURES_PATH, (req, res, next) => {
      this._tracer.warn(
        `Deprecation warning: "${FEATURES_PATH}" api path will be deprecated. Use "/behaviors" instead`
      );
      next();
    });
    this._router.use(FEATURES_PATH, behaviorsRouter);
    this._router.use("/behaviors", behaviorsRouter);
    this._router.use("/settings", new Settings(this._core, this._tracer).router);

    this._core.addCustomRouter("/mocks", this._router);
    return Promise.resolve();
  }
}

module.exports = Api;
