module.exports = [
  {
    basePath: "/api",
    document: {
      openapi: "3.0.0",
      info: {
        title: "Testing API",
        version: "1.0.0",
        description: "OpenApi document to create mock for testing purpses",
        contact: {
          email: "info@mocks-server.org",
        },
      },
      paths: {
        "/info/version": {
          get: {
            operationId: "infoVersion",
            tags: ["Info"],
            summary: "Server version",
            description: "Returns the server version running",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: {
                          type: "boolean",
                          example: true,
                        },
                      },
                    },
                  },
                },
              },
              400: {
                description: "Error",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: {
                          type: "boolean",
                        },
                      },
                      example: {
                        success: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },

        "/server/version": {
          get: {
            operationId: "serverVersion",
            tags: ["Info"],
            summary: "Server version",
            description: "Returns the server version running",
            responses: {
              200: {
                $ref: "#/components/responses/VersionResponse",
              },
              400: {
                $ref: "#/components/responses/BadRequest",
              },
              405: {
                description: "Invalid schema",
                content: {
                  "text/plain": {
                    schema: {},
                  },
                },
              },
              406: {
                description: "Invalid schema: mixed allOf",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          type: "object",
                        },
                        {
                          type: "array",
                        },
                        {
                          type: "string",
                          example: "Invalid",
                        },
                      ],
                    },
                  },
                },
              },
              407: {
                description: "AllOf with missing properties",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          type: "object",
                          properties: {
                            prop1: {
                              type: "string",
                              example: "prop1",
                            },
                          },
                        },
                        {
                          type: "object",
                        },
                        {
                          type: "object",
                          properties: {
                            prop3: {
                              type: "string",
                              example: "prop3",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
              408: {
                description: "Object without examples",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          type: "object",
                          properties: {
                            prop1: {
                              type: "string",
                            },
                          },
                        },
                        {
                          type: "object",
                          properties: {
                            prop2: {
                              type: "string",
                            },
                          },
                        },
                        {
                          type: "object",
                          properties: {
                            prop3: {
                              type: "string",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
              409: {
                description: "Additional properties without examples",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                      },
                    },
                  },
                },
              },
              410: {
                description: "Additional properties with inline example",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                        example: "Hello",
                      },
                    },
                  },
                },
              },
              411: {
                description: "Additional properties with example override",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                        example: "ignored",
                      },
                      example: {
                        en: "Hello",
                        fr: "Bonjour",
                      },
                    },
                  },
                },
              },
              412: {
                description: "Additional properties as boolean",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: true,
                    },
                  },
                },
              },
              413: {
                description: "Additional properties as boolean",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: false,
                    },
                  },
                },
              },
              414: {
                description: "No schema type",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {},
                    },
                  },
                },
              },
              415: {
                description: "Array example without items",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "array",
                      },
                    },
                  },
                },
              },
              416: {
                description: "Array example",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "array",
                        items: {
                          type: "string",
                          format: "uuid",
                        },
                      },
                    },
                  },
                },
              },
              417: {
                description: "String with format",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                        format: "password",
                      },
                    },
                  },
                },
              },
              418: {
                description: "Array example",
                content: {
                  "text/plain": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "array",
                        items: {},
                      },
                    },
                  },
                },
              },
              421: {
                description: "Array example without items (2)",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                    },
                  },
                },
              },
              422: {
                description: "Invalid type",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: {
                        type: "invalid",
                      },
                    },
                  },
                },
              },
              423: {
                description: "Example type with format",
                content: {
                  "text/plain": {
                    schema: {
                      type: "string",
                      format: "hostname",
                    },
                  },
                },
              },
              424: {
                description: "Example type with format",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        message: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
              500: {
                description: "internal error",
                content: {
                  "text/plain": {
                    schema: {
                      anyOf: [
                        {
                          type: "string",
                          example: "Internal server error",
                        },
                        {
                          type: "string",
                          example: "server is busy",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },

        "/users": {
          get: {
            operationId: "getUsers",
            summary: "Return all users",
            responses: {
              200: {
                description: "List of users",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
              418: {
                description: "I'm a teapot",
                content: {
                  "text/plain": {
                    schema: {
                      oneOf: [
                        {
                          type: "string",
                          example: "I'm",
                        },
                        {
                          type: "string",
                          example: "a",
                        },
                        {
                          type: "string",
                          example: "teapot",
                        },
                      ],
                    },
                  },
                },
              },
              500: {
                description: "server error",
                content: {
                  "text/plain": {
                    schema: {
                      type: "string",
                      example: "internal server error",
                    },
                  },
                },
              },
            },
          },
        },

        "/users/{id}": {
          get: {
            operationId: "getUser",
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
              200: {
                description: "user found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
              404: {
                description: "user not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/NotFound",
                    },
                  },
                },
              },
              405: {
                description: "Testing primitive without example or enum",
                content: {
                  "application/json": {
                    schema: {
                      type: "string",
                    },
                  },
                },
              },
              406: {
                description: "Testing primitive array",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "number",
                        example: 406,
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
        responses: {
          VersionResponse: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },

          BadRequest: {
            description: "Error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                  },
                },
              },
            },
          },
        },

        schemas: {
          User: {
            allOf: [
              {
                $ref: "#/components/schemas/SuccessResponse",
              },
              {
                type: "object",
                properties: {
                  firstName: {
                    type: "string",
                    example: "Joe",
                  },
                  lastName: {
                    type: "string",
                    example: "Doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joe.doe@example.com",
                  },
                  role: {
                    type: "string",
                    enum: ["developer", "maintainer", "admin"],
                  },
                },
              },
            ],
          },
          NotFound: {
            type: "object",
            properties: {
              code: {
                type: "integer",
                format: "int32",
                example: 404,
              },
              message: {
                type: "string",
                example: "Not found",
              },
            },
          },
          SuccessResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
            },
          },
        },
      },
    },
  },
];
