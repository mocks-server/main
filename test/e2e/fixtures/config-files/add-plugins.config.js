const path = require("path");
const TraceMocksPlugin2 = require("./TraceMocksPlugin2");

module.exports = {
  addPlugins: [TraceMocksPlugin2],
  options: {
    log: "silly",
    traceMocks: true,
    behavior: "user2",
    path: path.resolve(__dirname, "..", "web-tutorial-json"),
  },
};
