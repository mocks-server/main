/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const express = require("express");

class Root {
  constructor({ redirectUrl }) {
    this._router = express.Router();
    this._router.use(express.static(path.resolve(__dirname, "..", "static", "root")));
    const redirect = (_req, res) => {
      res.redirect(redirectUrl);
    };
    this._router.get("/", redirect);
    this._router.get("/index.html", redirect);
    this._router.get("/index.htm", redirect);
  }

  get router() {
    return this._router;
  }
}

module.exports = Root;
