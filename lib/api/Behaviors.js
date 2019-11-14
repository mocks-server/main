/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const express = require("express");

class BehaviorsApi {
  constructor(behaviors, tracer) {
    this._tracer = tracer;
    this._behaviors = behaviors;
    this._router = express.Router();
    this._router.get("/", this.getCollection.bind(this));
    this._router.get("/current", this.getCurrent.bind(this));
    this._router.put("/current", this.putCurrent.bind(this));
  }

  getCurrent(req, res) {
    this._tracer.verbose(`Sending current behavior | ${req.id}`);
    res.status(200);
    res.send(this._behaviors.currentFromCollection);
  }

  putCurrent(req, res) {
    const newCurrent = req.body.name;
    this._tracer.verbose(`Changing current behavior to "${newCurrent}" | ${req.id}`);
    this._behaviors.current = newCurrent;
    this.getCurrent(req, res);
  }

  getCollection(req, res) {
    this._tracer.verbose(`Sending behaviors collection | ${req.id}`);
    res.status(200);
    res.send(this._behaviors.collection);
  }

  get router() {
    return this._router;
  }
}

module.exports = BehaviorsApi;
