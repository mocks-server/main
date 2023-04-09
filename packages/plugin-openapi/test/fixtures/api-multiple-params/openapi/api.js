const openApiDocument = require("../../../openapi/users");

module.exports = [
  {
    basePath: "/api",
    document: {
      ...openApiDocument,
      paths: {
        ...openApiDocument.paths,
        "/users/{id}/books/{bookId}": {
          get: {
            parameters: [
              {
                name: "id",
                in: "path",
                description: "ID of the user",
                required: true,
                schema: {
                  type: "string",
                },
              },
              {
                name: "bookId",
                in: "path",
                description: "ID the user book",
                required: true,
                schema: {
                  type: "string",
                },
              },
            ],
            summary: "Return books of one user",
            responses: {
              "200": {
                description: "successful operation",
                content: {
                  "application/json": {
                    examples: {
                      success: {
                        summary: "One book",
                        value: {
                          id: 1,
                          title: "1984",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/users/{id}/books/{bookId}/pages/{pageNumber}": {
          get: {
            parameters: [
              {
                name: "id",
                in: "path",
                description: "ID of the user",
                required: true,
                schema: {
                  type: "string",
                },
              },
              {
                name: "bookId",
                in: "path",
                description: "ID the user book",
                required: true,
                schema: {
                  type: "string",
                },
              },
              {
                name: "pageNumber",
                in: "path",
                description: "Book page number",
                required: true,
                schema: {
                  type: "number",
                },
              },
            ],
            summary: "Return a page of a book of one user",
            responses: {
              "200": {
                description: "successful operation",
                content: {
                  "text/plain": {
                    examples: {
                      success: {
                        summary: "Example page",
                        value: "Page of the book 1984 by George Orwell.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
];
