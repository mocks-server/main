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
