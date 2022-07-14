const path = require("path");

module.exports = {
  log: "silly",
  routes: {
    collections: {
      selected: "user-2",
    }
  },
  files: {
    path: path.resolve(__dirname, "..", "temp"),
    watch: false,
  },
};
