const path = require("path");

module.exports = {
  log: "silly",
  mocks: {
    selected: "user-real",
  },
  plugins: {
    filesLoader: {
      babelRegister: true,
      path: path.resolve(__dirname, "..", "temp"),
      watch: true,
    }
  },
};
