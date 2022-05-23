const path = require("path");
const CustomRoutesHandler = require("./CustomRoutesHandler");

module.exports = {
  log: "silly",
  routesHandlers: [CustomRoutesHandler],
  mocks: {
    selected: "custom-users",
  },
  files: {
    path: path.resolve(__dirname, "..", "custom-routes-handler"),
  }
};
