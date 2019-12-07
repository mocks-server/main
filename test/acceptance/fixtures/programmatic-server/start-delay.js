const path = require("path");
const { Server } = require("../../../../index");

const server = new Server(path.resolve(__dirname, "..", "web-tutorial"), {
  port: 3100,
  log: "debug",
  delay: 2000
});

server.start().then(() => {
  console.log("Server started");
});
