const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    basePath: "/api",
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          get: {
            "x-mocks-server-route-id": "read-users",
            responses: {
              "200": {
                content: {
                  "application/json": {
                    examples: {
                      "one-user": {
                        "x-mocks-server-variant-id": "one-user",
                      },
                      "two-users": {
                        "x-mocks-server-variant-id": "two-users",
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: "create-user",
            responses: {
              "201": {
                "x-mocks-server-variant-id": "success",
              },
              "400": {
                content: {
                  "text/plain": {
                    examples: {
                      "error-message": {
                        "x-mocks-server-variant-id": "error",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/users/{id}": {
          get: {
            "x-mocks-server-route-id": "read-user",
            responses: {
              "200": {
                content: {
                  "application/json": {
                    examples: {
                      success: {
                        "x-mocks-server-variant-id": "success",
                      },
                    },
                  },
                },
              },
              "404": {
                content: {
                  "application/json": {
                    examples: {
                      "not-found": {
                        "x-mocks-server-variant-id": "not-found",
                      },
                    },
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
