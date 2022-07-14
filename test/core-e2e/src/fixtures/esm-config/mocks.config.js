const path = require("path");

module.exports = {
  log: "silly",
  routes: {
    collections: {
      selected: "user-real",
    }
  },
  files: {
    babelRegister: {
      enabled: true,
    },
    path: path.resolve(__dirname, "..", "temp"),
    watch: true,
  },
};
