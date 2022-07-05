const ProxyRoutesHandler = require("./ProxyRoutesHandler");
const ProxyRoutesHandlerV4 = require("./ProxyRoutesHandlerV4");

class Plugin {
  static get id() {
    return "proxyRoutesHandler";
  }

  constructor({ addRoutesHandler }) {
    addRoutesHandler(ProxyRoutesHandler);
    addRoutesHandler(ProxyRoutesHandlerV4);
  }
}

module.exports = Plugin;
