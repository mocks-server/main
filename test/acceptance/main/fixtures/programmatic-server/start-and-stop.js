const path = require("path");
const { Server } = require("../../../../../index");

const wait = (time = 2000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const server = new Server(path.resolve(__dirname, "..", "web-tutorial"), {
  port: 3100,
  log: "debug",
  watch: false
});

server.start().then(serverInstance => {
  console.log("Server started");
  return wait().then(() => {
    serverInstance.stop();
    console.log("Server stopped");
  });
});
