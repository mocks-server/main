const path = require("path");

module.exports = {
  log: "silly",
  mock: {
    collections: {
      selected: "user-real",
    }
  },
  files: {
    babelRegister: {
      enabled: false,
    },
    path: path.resolve(__dirname, "..", "temp"),
    watch: false,
  },
};
