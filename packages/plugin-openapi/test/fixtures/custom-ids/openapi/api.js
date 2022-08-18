const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    basePath: "/api",
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          post: {
            "x-mocks-server-route-id": "create-user",
          },
          get: {
            "x-mocks-server-route-id": "read-users",
          },
        },
        "/users/{id}": {
          get: {
            "x-mocks-server-route-id": "read-user",
          },
        },
      },
    }),
  },
];
