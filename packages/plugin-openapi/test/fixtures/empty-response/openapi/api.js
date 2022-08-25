const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          post: {
            responses: {
              "201": undefined,
              "400": undefined,
            },
          },
          get: {
            responses: {
              "200": undefined,
            },
          },
        },
      },
    }),
  },
];
