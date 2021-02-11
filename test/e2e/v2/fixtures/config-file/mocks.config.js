const path = require("path");

module.exports = {
  options: {
    log: "silly",
    mock: "user-2",
    path: path.resolve(__dirname, "..", "temp"),
    watch: false,
  },
};
