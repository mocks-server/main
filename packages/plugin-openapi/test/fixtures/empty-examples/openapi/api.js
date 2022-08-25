const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          post: undefined,
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
