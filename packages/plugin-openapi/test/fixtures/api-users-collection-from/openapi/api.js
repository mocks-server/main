const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    basePath: "/api",
    collection: {
      id: "users",
      from: "base",
    },
    document: openApiDocument,
  },
];
