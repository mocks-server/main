const path = require("path");

module.exports = {
  log: "silly",
  mocks: {
    selected: "user-real",
  },
  files: {
    path: path.resolve(__dirname, "..", "typescript-imports"),
    watch: true,
    babelRegister: {
      enabled: true,
      options: {
        only: [
          (filePath) => {
            return (
              filePath.includes(`fixtures${path.sep}typescript${path.sep}`) ||
              filePath.includes(`fixtures${path.sep}typescript-imports${path.sep}`)
            );
          },
        ],
        extensions: [".ts", ".js"],
      }
    },
  },
};
