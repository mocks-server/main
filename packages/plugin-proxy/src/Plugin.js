// TODO, publish as a handler, not as a plugin
const ProxyRoutesHandler = require("./ProxyRoutesHandler");

class Plugin {
  static get id() {
    return "proxyRoutesHandler";
  }

  constructor({ variantHandlers }) {
    variantHandlers.register([ProxyRoutesHandler]);
  }
}

module.exports = Plugin;
