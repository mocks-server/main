const path = require("path");
const CustomRoutesHandler = require("./CustomRoutesHandler");

module.exports = {
  log: "silly",
  variantHandlers: {
    register: [CustomRoutesHandler],
  },
  mock: {
    collections: {
      selected: "custom-users",
    }
  },
  files: {
    path: path.resolve(__dirname, "..", "custom-routes-handler"),
  }
};
