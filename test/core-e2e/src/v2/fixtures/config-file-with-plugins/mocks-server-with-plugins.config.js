const path = require("path");
const TraceRoutesPlugin = require("./TraceRoutesPlugin");

module.exports = {
  log: "silly",
  plugins: {
    register: [TraceRoutesPlugin],
    filesLoader: {
      path: path.resolve(__dirname, "..", "temp"),
    }
  },
  mocks: {
    selected: "user-2",
  },
};
