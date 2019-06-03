"use strict";

const express = require("express");

const tracer = require("../common/tracer");

class FeaturesApi {
  constructor(features) {
    this._features = features;
    this._router = express.Router();
    this._router.get("/", this.getCollection.bind(this));
    this._router.get("/current", this.getCurrent.bind(this));
    this._router.put("/current", this.putCurrent.bind(this));
  }

  getCurrent(req, res) {
    tracer.verbose(`Sending current feature | ${req.id}`);
    res.status(200);
    res.send(this._features.currentFromCollection);
  }

  putCurrent(req, res) {
    const newCurrent = req.body.name;
    tracer.verbose(`Changing current feature to "${newCurrent}" | ${req.id}`);
    this._features.current = newCurrent;
    this.getCurrent(req, res);
  }

  getCollection(req, res) {
    tracer.verbose(`Sending features collection | ${req.id}`);
    res.status(200);
    res.send(this._features.collection);
  }

  get router() {
    return this._router;
  }
}

module.exports = FeaturesApi;
