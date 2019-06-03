"use strict";

const express = require("express");

const Features = require("./Features");
const Settings = require("./Settings");

class Api {
  constructor(features, settings) {
    this._features = features;
    this._router = express.Router();
    this._router.use("/features", new Features(features).router);
    this._router.use("/settings", new Settings(settings).router);
  }

  get router() {
    return this._router;
  }
}

module.exports = Api;
