const path = require("path");
const TraceRoutesPlugin = require("./TraceRoutesPlugin");

module.exports = {
  log: "silly",
  files: {
    path: path.resolve(__dirname, "..", "temp"),
  },
  plugins: {
    register: [TraceRoutesPlugin],
  },
  mock: {
    collections: {
      selected: "user-2",
    }
  },
};
