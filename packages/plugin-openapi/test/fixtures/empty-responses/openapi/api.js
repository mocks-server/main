const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          post: {
            responses: undefined,
          },
          get: {
            responses: undefined,
          },
        },
      },
    }),
  },
];
