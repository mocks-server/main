const path = require("path");
const CustomRoutesHandler = require("./CustomRoutesHandler");

module.exports = {
  addRoutesHandlers: [CustomRoutesHandler],
  options: {
    log: "silly",
    mock: "custom-users",
    path: path.resolve(__dirname, "..", "custom-routes-handler"),
  },
};
