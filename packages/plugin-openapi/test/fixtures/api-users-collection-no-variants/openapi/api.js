const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    basePath: "/api",
    collection: {
      id: "users",
    },
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    examples: undefined,
                  },
                },
              },
            },
          },
        },
      },
    }),
  },
];
