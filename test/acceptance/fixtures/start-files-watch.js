const path = require("path");
const { startServer } = require("../utils");

startServer(path.resolve(__dirname, "files-watch"), {
  watch: true,
});
