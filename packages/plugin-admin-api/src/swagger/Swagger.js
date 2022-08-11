const path = require("path");
const express = require("express");

const swaggerUIDist = require("swagger-ui-dist");

const { serverUrl } = require("../common/helpers");
const openApi = require("./openapi");

class Swagger {
  constructor({ config }) {
    this._openApiMiddleware = this._openApiMiddleware.bind(this);
    this._openApi = openApi;
    this._config = config;

    this._router = express.Router();
    this._router.get("/openapi.json", this._openApiMiddleware);
    this._router.use(express.static(path.resolve(__dirname, "..", "..", "static", "swagger")));
    this._router.use(express.static(swaggerUIDist.absolutePath()));
  }

  setOptions({ version, port, host, protocol }) {
    this._openApi.info.version = version;
    this._openApi.servers[0].url = `${serverUrl({ host, port, protocol })}/api`;
    this._openApi.components.schemas.Config = this._config.root.getValidationSchema();
  }

  _openApiMiddleware(_req, res) {
    res.status(200).send(this._openApi);
  }

  get router() {
    return this._router;
  }
}

module.exports = Swagger;
