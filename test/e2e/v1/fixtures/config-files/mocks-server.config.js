const path = require("path");
const TraceMocksPlugin = require("./TraceMocksPlugin");

module.exports = {
  plugins: [TraceMocksPlugin],
  options: {
    log: "silly",
    traceMocks: true,
    behavior: "user2",
    pathLegacy: path.resolve(__dirname, "..", "web-tutorial-json"),
  },
};
