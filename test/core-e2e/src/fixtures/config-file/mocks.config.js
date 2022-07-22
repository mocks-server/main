const path = require("path");

module.exports = {
  log: "silly",
  mock: {
    collections: {
      selected: "user-2",
    }
  },
  files: {
    path: path.resolve(__dirname, "..", "temp"),
    watch: false,
  },
};
