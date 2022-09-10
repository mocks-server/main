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

  constructor(options, core) {
    this._options = options;
    this._core = core;
    this._host = this._options.host;
    this._optionsProxy = this._options.options;
    this.middleware = httpProxy(this._host, this._optionsProxy);
  }

  get preview() {
    return {
      host: this._host,
    };
  }
}

module.exports = ProxyRoutesHandler;
