const path = require("path");
const { Server } = require("../../../../index");

const server = new Server(path.resolve(__dirname, "..", "files-watch"), {
  port: 3100,
  log: "debug",
  watch: true
});

server.start().then(() => {
  console.log("Server started");
});
