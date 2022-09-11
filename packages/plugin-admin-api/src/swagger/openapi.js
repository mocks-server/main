const {
  ABOUT,
  CONFIG,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
} = require("@mocks-server/admin-api-paths");

module.exports = {
  openapi: "3.0.1", // Swagger still does not support 3.1.0
  info: {
    title: "Mocks Server admin API",
    description:
      "This API is provided by the Mocks Server's plugin [@mocks-server/plugin-admin-api](https://www.npmjs.com/package/@mocks-server/plugin-admin-api). It allows to administrate the mock server while it is running, allowing to change its configuration, etc.",
    contact: {
      email: "info@mocks-server.org",
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
    version: "3.1.0",
  },
  externalDocs: {
    description: "Find out more about Mocks Server administration API",
    url: "https://www.mocks-server.org/docs/integrations/rest-api",
  },
  servers: [
    {
      url: "",
    },
  ],
  tags: [
    {
      name: "about",
      description: "Server and plugins info",
    },
    {
      name: "config",
      description: "Access to Mocks Server configuration",
      externalDocs: {
        description: "Find out more",
        url: "https://www.mocks-server.org/docs/configuration/options",
      },
    },
    {
      name: "alerts",
      description: "Access to Mocks Server alerts",
      externalDocs: {
        description: "Find out more",
        url: "https://www.mocks-server.org/docs/api/javascript/alerts",
      },
    },
    {
      name: "mock",
      description: "Operations about the API mock",
      externalDocs: {
        description: "Find out more",
        url: "https://www.mocks-server.org/docs/usage/basics",
      },
    },
  ],
  paths: {
    [ABOUT]: {
      get: {
        tags: ["about"],
        summary: "Returns info about server and plugins",
        description: "Use it to get current versions of Mocks Server packages",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/About",
                },
              },
            },
          },
        },
      },
    },
    [CONFIG]: {
      get: {
        tags: ["config"],
        summary: "Returns current configuration",
        description: "Current configuration object from all config namespaces",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Config",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["config"],
        summary: "Updates configuration",
        description: "Accepts an object with configuration properties to be changed",
        requestBody: {
          description: "Partially updated configuration object",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Config",
              },
              examples: {
                "mock.collections.selected": {
                  summary: "Change current collection",
                  value: {
                    mock: {
                      collections: {
                        selected: "foo",
                      },
                    },
                  },
                },
                log: {
                  summary: "Change log level",
                  value: {
                    log: "silly",
                  },
                },
                "server.port": {
                  summary: "Change server port",
                  value: {
                    server: {
                      port: 3200,
                    },
                  },
                },
              },
            },
          },
          required: true,
        },
        responses: {
          "204": {
            description:
              "configuration updated. Note that some configuration properties may take time to have real effect",
          },
          "400": {
            description: "Invalid config supplied",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    [ALERTS]: {
      get: {
        tags: ["alerts"],
        summary: "Returns current alerts",
        description: "Mocks Server alerts from all namespaces",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Alerts",
                },
                examples: {
                  "mock:collections:selected": {
                    summary: "Option mocks.collections.selected was not defined",
                    value: [
                      {
                        id: "mock:collections:selected",
                        message:
                          "Option 'mock.collections.selected' was not defined. Selecting the first collection found",
                        error: null,
                      },
                    ],
                  },
                  "files:collections:error": {
                    summary: "Error loading collections",
                    value: [
                      {
                        id: "files:collections:error",
                        message:
                          "Error loading collections from file /Users/foo/project/mocks/collections.js",
                        error: {
                          name: "ReferenceError",
                          message: "foo is not defined",
                          stack:
                            "ReferenceError: foo is not defined\n    at Object.<anonymous> (/Users/foo/project/mocks/collections.js:10:4)",
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${ALERTS}/{alertId}`]: {
      get: {
        tags: ["alerts"],
        summary: "Find alert by ID",
        description: "Returns a single alert",
        parameters: [
          {
            name: "alertId",
            in: "path",
            description: "ID of alert to return",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Alert",
                },
                examples: {
                  "mock:collections:selected": {
                    summary: "Option mocks.collections.selected was not defined",
                    value: {
                      id: "mock:collections:selected",
                      message:
                        "Option 'mock.collections.selected' was not defined. Selecting the first collection found",
                      error: null,
                    },
                  },
                  "files:collections:error": {
                    summary: "Error loading collections",
                    value: {
                      id: "files:collections:error",
                      message:
                        "Error loading collections from file /Users/foo/project/mocks/collections.js",
                      error: {
                        name: "ReferenceError",
                        message: "foo is not defined",
                        stack:
                          "ReferenceError: foo is not defined\n    at Object.<anonymous> (/Users/foo/project/mocks/collections.js:10:4)",
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Alert not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    [ROUTES]: {
      get: {
        tags: ["mock"],
        summary: "Returns routes",
        description:
          "Returns available routes. Find out more about [routes](https://www.mocks-server.org/docs/usage/routes)",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Routes",
                },
                examples: {
                  "one-routes": {
                    summary: "One route",
                    value: [
                      {
                        id: "get-user",
                        url: "/api/user",
                        method: "get",
                        delay: null,
                        variants: ["get-user:1", "get-user:2"],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${ROUTES}/{routeId}`]: {
      get: {
        tags: ["mock"],
        summary: "Find collection by ID",
        description: "Returns a single [route](https://www.mocks-server.org/docs/usage/routes)",
        parameters: [
          {
            name: "routeId",
            in: "path",
            description: "ID of route to return",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Route",
                },
                examples: {
                  "one-route": {
                    summary: "One route",
                    value: {
                      id: "get-user",
                      url: "/api/user",
                      method: "get",
                      delay: null,
                      variants: ["get-user:1", "get-user:2"],
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Route not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    [VARIANTS]: {
      get: {
        tags: ["mock"],
        summary: "Returns route variants",
        description:
          "Returns available route variants. Find out more about [variants](https://www.mocks-server.org/docs/usage/variants)",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Variants",
                },
                examples: {
                  "two-variants": {
                    summary: "Two variants",
                    value: [
                      {
                        id: "get-user:1",
                        route: "get-user",
                        type: "json",
                        disabled: false,
                        preview: {
                          body: {
                            email: "foo@foo.com",
                          },
                          status: 200,
                        },
                        delay: null,
                      },
                      {
                        id: "get-user:2",
                        route: "get-user",
                        type: "json",
                        disabled: false,
                        preview: {
                          body: {
                            email: "foo@foo.com",
                          },
                          status: 200,
                        },
                        delay: null,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${VARIANTS}/{variantId}`]: {
      get: {
        tags: ["mock"],
        summary: "Find route variant by ID",
        description:
          "Returns a single [route variant](https://www.mocks-server.org/docs/usage/variants)",
        parameters: [
          {
            name: "variantId",
            in: "path",
            description: "ID of the variant to return",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Variant",
                },
                examples: {
                  "one-variant": {
                    summary: "Variant",
                    value: {
                      id: "get-user:2",
                      route: "get-user",
                      type: "json",
                      disabled: false,
                      preview: {
                        body: {
                          email: "foo@foo.com",
                        },
                        status: 200,
                      },
                      delay: null,
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Variant not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    [COLLECTIONS]: {
      get: {
        tags: ["mock"],
        summary: "Returns collections",
        description:
          "Returns available collections. Find out more about [collections](https://www.mocks-server.org/docs/usage/collections)",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Collections",
                },
                examples: {
                  "two-collections": {
                    summary: "Two collections",
                    value: [
                      {
                        id: "base",
                        from: null,
                        definedRoutes: ["get-users", "get-user:1"],
                        routes: ["get-user:1"],
                      },
                      {
                        id: "user-2",
                        from: "base",
                        definedRoutes: ["get-user:2"],
                        routes: ["get-users", "get-user:2"],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${COLLECTIONS}/{collectionId}`]: {
      get: {
        tags: ["mock"],
        summary: "Find collection by ID",
        description:
          "Returns a single [collection](https://www.mocks-server.org/docs/usage/collections)",
        parameters: [
          {
            name: "collectionId",
            in: "path",
            description: "ID of collection to return",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Collection",
                },
                examples: {
                  collection: {
                    summary: "Collection",
                    value: {
                      id: "base",
                      from: null,
                      definedRoutes: ["get-users", "get-user:1"],
                      routes: ["get-user:1"],
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Collection not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    [CUSTOM_ROUTE_VARIANTS]: {
      get: {
        tags: ["mock"],
        summary: "Returns current custom route variants",
        description:
          "Returns route variant ids that are currently used instead of those defined in the current collection. [Find out more](https://www.mocks-server.org/docs/usage/collections#defining-custom-route-variants)",
        responses: {
          "200": {
            description: "successful operation",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CustomRouteVariants",
                },
                examples: {
                  "two-custom-route-variants": {
                    summary: "One custom route variant",
                    value: ["get-user:2"],
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["mock"],
        summary: "Adds a custom route variant",
        description:
          "Defines a route variant to be used instead of the one defined in the current collection. [Find out more](https://www.mocks-server.org/docs/usage/collections#defining-custom-route-variants)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  id: {
                    $ref: "#/components/schemas/RouteVariantId",
                  },
                },
              },
              examples: {
                "add-custom-route-variant": {
                  summary: "Add custom route variant",
                  value: {
                    id: "get-user:2",
                  },
                },
              },
            },
          },
        },
        responses: {
          "204": {
            description: "successful operation",
          },
          "400": {
            description: "Invalid route variant id supplied",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["mock"],
        summary: "Removes all custom route variants",
        description:
          "Restores current collection route variants. [Find out more](https://www.mocks-server.org/docs/usage/collections#defining-custom-route-variants)",
        responses: {
          "204": {
            description: "successful operation",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      About: {
        type: "object",
        properties: {
          version: {
            type: "object",
            properties: {
              core: {
                type: "string",
                description: "@mocks-server/core version",
              },
              adminApi: {
                type: "string",
                description: "@mocks-server/plugin-admin-api version",
              },
            },
          },
        },
      },
      Config: {},
      Alert: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Alert id. Includes all of the parents namespaces ids joined with ':'",
          },
          message: {
            type: "string",
            description: "Alert message",
          },
          error: {
            type: "object",
            description: "If the alert was produced by an error, it is described here",
            properties: {
              name: {
                type: "string",
                description: "Error name",
              },
              message: {
                type: "string",
                description: "Error description",
              },
              stack: {
                type: "string",
                description: "Error stack",
              },
            },
            nullable: true,
          },
        },
      },
      Alerts: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Alert",
        },
      },
      Route: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Route id",
          },
          url: {
            type: "string",
            description: "Route url",
          },
          method: {
            description: "Route HTTP method or methods",
            oneOf: [
              {
                type: "array",
                items: {
                  $ref: "#/components/schemas/RouteMethod",
                },
              },
              {
                $ref: "#/components/schemas/RouteMethod",
              },
            ],
          },
          delay: {
            type: "string",
            description: "Route delay. When defined, it overrides the global routes delay setting",
            nullable: true,
          },
          variants: {
            type: "array",
            description: "Route variants IDs belonging to this route",
            items: {
              $ref: "#/components/schemas/RouteVariantId",
            },
          },
        },
      },
      Routes: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Route",
        },
      },
      Variant: {
        type: "object",
        properties: {
          id: {
            $ref: "#/components/schemas/RouteVariantId",
          },
          route: {
            type: "string",
            description: "Route ID",
          },
          type: {
            type: "string",
            description: "Variant handler ID",
          },
          disabled: {
            type: "boolean",
            description: "When true, using this variant disables the route",
          },
          preview: {
            type: "object",
            description:
              "Approached preview of the response that will be sent when the route variant is used. Null when it is not possible to have an idea of the response",
            nullable: true,
          },
          delay: {
            type: "number",
            description:
              "Route delay. When defined, it overrides the route delay and the global routes delay setting. If it is null, the route delay is ignored and the global delay setting is used",
            nullable: true,
          },
        },
      },
      Variants: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Variant",
        },
      },
      Collection: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Collection id",
          },
          from: {
            type: "string",
            description: "Id of other collection from which this one extends",
            nullable: true,
          },
          routes: {
            type: "array",
            description:
              "Ids of the route variants applied to this collection. It takes into account routes from the base collections",
            items: {
              $ref: "#/components/schemas/RouteVariantId",
            },
          },
          definedRoutes: {
            type: "array",
            description: "Ids of the route variants explicitly defined for the collection",
            items: {
              $ref: "#/components/schemas/RouteVariantId",
            },
          },
        },
      },
      Collections: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Collection",
        },
      },
      RouteVariantId: {
        type: "string",
        description: "Route and variant id joined with ':'",
      },
      RouteMethod: {
        type: "string",
        enum: ["get", "post", "patch", "delete", "put", "options", "head", "trace"],
        description: "HTTP method",
      },
      CustomRouteVariants: {
        type: "array",
        description:
          "Ids of the route variants that are currently used instead of those defined in the current collection",
        items: {
          $ref: "#/components/schemas/RouteVariantId",
        },
      },
      Error: {
        type: "object",
        properties: {
          statusCode: {
            type: "integer",
            description: "Response status code",
            format: "int16",
          },
          error: {
            type: "string",
            description: "Error description",
          },
          message: {
            type: "string",
            description: "Error message",
          },
        },
      },
    },
  },
};
