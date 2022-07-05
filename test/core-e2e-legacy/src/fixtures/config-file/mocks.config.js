const path = require("path");

module.exports = {
  log: "silly",
  mocks: {
    selected: "user-2",
  },
  files: {
    path: path.resolve(__dirname, "..", "temp"),
    watch: false,
  },
};
