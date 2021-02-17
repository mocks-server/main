/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const {
  DEFAULT_BASE_PATH,
  BEHAVIORS,
  FIXTURES,
  LEGACY,
} = require("@mocks-server/admin-api-paths");

const Behaviors = require("./Behaviors");
const Fixtures = require("./Fixtures");

const { PLUGIN_NAME } = require("../support/constants");

// TODO, deprecate mocks router

class Api {
  constructor(core, { addAlert }) {
    this._core = core;
    this._tracer = core.tracer;
    this._addAlert = addAlert;
  }

  init() {
    const behaviorsRouter = new Behaviors(this._core).router;
    const fixturesRouter = new Fixtures(this._core).router;
    this._router = express.Router();
    this._router.use((req, res, next) => {
      this._addAlert("legacy", `Detected usage of deprecated api path "${LEGACY}"`);
      this._core.tracer.deprecationWarn(`"${LEGACY}" ${PLUGIN_NAME} path`, DEFAULT_BASE_PATH);
      next();
    });
    this._router.use(FIXTURES, fixturesRouter);
    this._router.use(BEHAVIORS, behaviorsRouter);
  }

  get router() {
    return this._router;
  }
}

module.exports = Api;
