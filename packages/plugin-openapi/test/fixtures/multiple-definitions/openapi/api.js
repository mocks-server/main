const openApiDocument = require("../../../openapi/users");
const openApiDocumentCustomIds = require("../../custom-ids/openapi/api")[0];

module.exports = [
  {
    basePath: "/api",
    document: openApiDocument,
  },
  {
    ...openApiDocumentCustomIds,
    basePath: "/api-2",
  },
];
