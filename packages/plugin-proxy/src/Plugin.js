const ProxyRoutesHandler = require("./ProxyRoutesHandler");

class Plugin {
  static get id() {
    return "proxyRoutesHandler";
  }

  constructor(core) {
    core.addRoutesHandler(ProxyRoutesHandler);
  }
}

module.exports = Plugin;
