const path = require("path");
const { startServer } = require("../support/utils");

startServer(path.resolve(__dirname, "files-watch"), {
  watch: true,
});
