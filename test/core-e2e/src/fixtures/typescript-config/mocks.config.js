const path = require("path");

module.exports = {
  routes: {
    collections: {
      selected: "user-real",
    }
  },
  log: "silly",
  files: {
    path: path.resolve(__dirname, "..", "typescript"),
    watch: true,
    babelRegister: {
      enabled: true,
    },
  },
};
