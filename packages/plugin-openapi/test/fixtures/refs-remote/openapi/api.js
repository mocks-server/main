module.exports = [
  {
    basePath: "/api",
    document: {
      openapi: "3.1.0",
      info: {
        title: "Testing API",
        version: "1.0.0",
        description: "OpenApi document to create mock for testing purpses",
        contact: {
          email: "info@mocks-server.org",
        },
      },
      paths: {
        "/users": {
          $ref: "http://127.0.0.1:3200/users.json",
        },
        "/users/{id}": {
          get: {
            parameters: [
              {
                name: "id",
                in: "path",
                description: "ID the user",
                required: true,
                schema: {
                  type: "string",
                },
              },
            ],
            summary: "Return one user",
            responses: {
              "200": {
                $ref: "http://127.0.0.1:3200/user.json",
              },
              "404": {
                description: "user not found",
                content: {
                  "application/json": {
                    examples: {
                      "not-found": {
                        $ref: "#/components/examples/NotFound",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        examples: {
          NotFound: {
            summary: "Not found error",
            value: {
              code: 404,
              message: "Not found",
            },
          },
        },
      },
    },
  },
];
