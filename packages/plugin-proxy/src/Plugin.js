const ProxyRoutesHandler = require("./ProxyRoutesHandler");

class Plugin {
  static get id() {
    return "proxyRoutesHandler";
  }

  constructor({ addRoutesHandler }) {
    addRoutesHandler(ProxyRoutesHandler);
  }
}

module.exports = Plugin;
