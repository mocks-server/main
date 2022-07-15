const ProxyRoutesHandler = require("./ProxyRoutesHandler");
const ProxyRoutesHandlerV4 = require("./ProxyRoutesHandlerV4");

class Plugin {
  static get id() {
    return "proxyRoutesHandler";
  }

  constructor({ variantHandlers }) {
    variantHandlers.register([ProxyRoutesHandler, ProxyRoutesHandlerV4]);
  }
}

module.exports = Plugin;
