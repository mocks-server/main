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
                      examples: {
                        "one-user": {
                          summary: "One route",
                          value: [
                            {
                              id: 1,
                              name: "John Doe",
                            },
                          ],
                        },
                        "two-users": {
                          summary: "Two users",
                          value: [
                            {
                              id: 1,
                              name: "John Doe",
                            },
                            {
                              id: 2,
                              name: "Jane Doe",
                            },
                          ],
                        },
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
                },
                "400": {
                  description: "bad data",
                  content: {
                    "text/plain": {
                      examples: {
                        "error-message": {
                          summary: "Error message",
                          value: "Bad data",
                        },
                      },
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
              "application/json": {
                examples: {
                  success: {
                    summary: "One user",
                    value: {
                      id: 1,
                      name: "John Doe",
                    },
                  },
                },
              },
            },
          },
        },
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
