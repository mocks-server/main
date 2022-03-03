const httpProxy = require("express-http-proxy");

class ProxyRoutesHandler {
  static get id() {
    return "proxy";
  }

  constructor(route, mocksServer) {
    this._response = route.response;
    this._variantId = route.variantId;
    this._mocksServer = mocksServer;
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
