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
          $ref: "#/components/pathItems/Users",
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
                $ref: "#/components/responses/User",
              },
              "404": {
                description: "user not found",
                content: {
                  "application/json": {
                    example: {
                      $ref: "#/components/examples/NotFound",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        pathItems: {
          Users: {
            get: {
              summary: "Return all users",
              description: "Use it to get current users",
              responses: {
                "200": {
                  description: "successful operation",
                  content: {
                    "application/json": {
                      example: {
                        id: 1,
                        name: "John Doe",
                      },
                    },
                  },
                },
              },
            },
            post: {
              summary: "Create an user",
              responses: {
                "201": {
                  description: "successful operation",
                  content: {
                    "application/json": {
                      example: {
                        id: 2,
                        name: "Jane Doe",
                      },
                    },
                  },
                },
                "400": {
                  description: "bad data",
                  content: {
                    "text/plain": {
                      example: "Bad data",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          User: {
            description: "successful operation",
            content: {
              "application/json": {},
            },
          },
        },
        examples: {
          NotFound: {
            code: 404,
            message: "Not found",
          },
        },
      },
    },
  },
];
