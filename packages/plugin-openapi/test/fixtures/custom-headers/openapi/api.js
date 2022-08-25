const deepMerge = require("deepmerge");

const openApiDocument = require("../../custom-ids/openapi/api")[0].document;

module.exports = [
  {
    basePath: "/api",
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          get: {
            responses: {
              "200": {
                headers: {
                  "x-custom-header-read-users": "read-users-value",
                  "Content-Type": "foo",
                },
              },
            },
          },
          post: {
            responses: {
              "201": {
                headers: {
                  "x-custom-header-create-user": "create-user-value",
                  "x-custom-header-create-user-2": "create-user-value-2",
                },
              },
              "400": {
                content: {
                  "text/html": {
                    examples: {
                      "error-message": {
                        "x-mocks-server-variant-id": "error",
                        value: "<div>Error</div>",
                      },
                    },
                  },
                  "text/plain": undefined,
                },
              },
            },
          },
        },
        "/users/{id}": undefined,
      },
    }),
  },
];
