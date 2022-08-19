module.exports = [
  {
    basePath: "/api",
    document: {
      openapi: "3.1.0",
      info: {
        title: "Testing API",
        description: "OpenApi document to create mock for testing purpses",
        contact: {
          email: "info@mocks-server.org",
        },
      },
      paths: {
        "/users": {
          get: {
            summary: "Return all users",
            description: "Use it to get current users",
            responses: {
              default: {
                description: "successful operation",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Users",
                    },
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
              default: {
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
        "/users/{id}": {
          get: {
            summary: "Return one user",
            responses: {
              "2XX": {
                description: "successful operation",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
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
              "404": {
                description: "user not found",
                content: {
                  "application/json": {
                    examples: {
                      "not-found": {
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
            },
          },
        },
      },
    },
  },
];
