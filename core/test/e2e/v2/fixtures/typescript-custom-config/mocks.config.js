const path = require("path");

module.exports = {
  // options
  options: {
    // mock to use on start
    mock: "user-real",
    log: "silly",
    path: path.resolve(__dirname, "..", "typescript-imports"),
    watch: true,
  },

  // low level config
  babelRegister: true,
  babelRegisterOptions: {
    only: [
      (filePath) => {
        return filePath.includes(`fixtures${path.sep}typescript${path.sep}`) || filePath.includes(`fixtures${path.sep}typescript-imports${path.sep}`);
      },
    ],
    extensions: [".ts", ".js"]
  }
};
