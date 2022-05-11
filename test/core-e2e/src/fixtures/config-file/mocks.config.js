const path = require("path");

module.exports = {
  log: "silly",
  mocks: {
    selected: "user-2",
  },
  plugins: {
    filesLoader: {
      path: path.resolve(__dirname, "..", "temp"),
      watch: false,
    },
  },
};
