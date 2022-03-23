const path = require("path");

module.exports = {
  // options
  options: {
    // mock to use on start
    mock: "user-real",
    log: "silly",
    path: path.resolve(__dirname, "..", "typescript"),
    watch: true,
  },

  // low level config
  babelRegister: true,
};
