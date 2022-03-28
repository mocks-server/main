const path = require("path");
const TraceRoutesPlugin = require("./TraceRoutesPlugin");

module.exports = {
  addPlugins: [TraceRoutesPlugin],
  options: {
    log: "silly",
    mock: "user-2",
    path: path.resolve(__dirname, "..", "temp"),
  },
};
