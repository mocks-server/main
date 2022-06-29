const httpProxy = require("express-http-proxy");

class ProxyRoutesHandler {
  static get id() {
    return "proxy";
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

  constructor(route, core) {
    this._response = route.response;
    this._variantId = route.variantId;
    this._core = core;
    this._host = route.host;
    this._options = route.options;
    this.middleware = httpProxy(this._host, this._options);
  }

  get plainResponsePreview() {
    return {
      host: this._host,
    };
  }
}

module.exports = ProxyRoutesHandler;
