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
        console.log(filePath);
        return filePath.includes("/typescript/") || filePath.includes("/typescript-imports/");
      },
    ],
    extensions: [".ts", ".js"]
  }
};
