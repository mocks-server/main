const packageInfo = require("../package.json");
const ProxyRoutesHandler = require("./ProxyRoutesHandler");

class Plugin {
  constructor(core) {
    core.addRoutesHandler(ProxyRoutesHandler);
  }

  get displayName() {
    return packageInfo.name;
  }

  init() {
    // do nothing
  }

  start() {
    // do nothing
  }

  stop() {
    // do nothing
  }
}

module.exports = Plugin;
