const deepMerge = require("deepmerge");

const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    document: deepMerge(openApiDocument, {
      paths: {
        "/users": {
          get: undefined,
          post: undefined,
        },
      },
    }),
  },
];
