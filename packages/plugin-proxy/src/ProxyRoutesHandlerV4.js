const httpProxy = require("express-http-proxy");

class ProxyRoutesHandler {
  static get id() {
    return "proxy-v4";
  }

  static get version() {
    return "4";
  }

  static get validationSchema() {
    return {
      type: "object",
      properties: {
        host: {
          oneOf: [
            {
              type: "string",
            },
            {
              instanceof: "Function",
            },
          ],
        },
        options: {
          type: "object",
        },
      },
      required: ["host"],
    };
  }

  constructor(response, core) {
    this._response = response;
    this._core = core;
    this._host = this._response.host;
    this._options = this._response.options;
    this.middleware = httpProxy(this._host, this._options);
  }

  get preview() {
    return {
      host: this._host,
    };
  }
}

module.exports = ProxyRoutesHandler;
