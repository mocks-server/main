import { startServer, waitForServer } from "./support/helpers";

describe("when openapi has object with examples", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("example-in-schema");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("routes", () => {
    it("should have created routes from openapi", async () => {
      expect(server.mock.routes.plain).toEqual([
        {
          id: "infoVersion",
          url: "/api/info/version",
          method: "get",
          delay: null,
          variants: ["infoVersion:200-json-example", "infoVersion:400-json-example"],
        },
        {
          id: "serverVersion",
          url: "/api/server/version",
          method: "get",
          delay: null,
          variants: [
            "serverVersion:200-json-example",
            "serverVersion:400-json-example",
            "serverVersion:500-text-example",
          ],
        },
        {
          id: "getUsers",
          url: "/api/users",
          method: "get",
          delay: null,
          variants: [
            "getUsers:200-json-example",
            "getUsers:418-text-example",
            "getUsers:500-text-example",
          ],
        },
        {
          id: "getUser",
          url: "/api/users/:id",
          method: "get",
          delay: null,
          variants: [
            "getUser:200-json-example",
            "getUser:404-json-example",
            "getUser:406-json-example",
          ],
        },
      ]);
    });

    it("Should have created variants from openapi with examples defined in objects", async () => {
      expect(server.mock.routes.plainVariants).toEqual([
        {
          id: "infoVersion:200-json-example",
          type: "json",
          route: "infoVersion",
          delay: null,
          disabled: false,
          preview: {
            status: 200,
            body: {
              success: true,
            },
          },
        },
        {
          id: "infoVersion:400-json-example",
          type: "json",
          route: "infoVersion",
          delay: null,
          disabled: false,
          preview: {
            status: 400,
            body: {
              success: false,
            },
          },
        },
        {
          id: "serverVersion:200-json-example",
          type: "json",
          route: "serverVersion",
          delay: null,
          disabled: false,
          preview: {
            status: 200,
            body: {
              success: true,
            },
          },
        },
        {
          id: "serverVersion:400-json-example",
          type: "json",
          route: "serverVersion",
          delay: null,
          disabled: false,
          preview: {
            status: 400,
            body: {
              success: false,
            },
          },
        },
        {
          id: "serverVersion:500-text-example",
          type: "text",
          route: "serverVersion",
          delay: null,
          disabled: false,
          preview: {
            status: 500,
            body: "Internal server error",
          },
        },
        {
          id: "getUsers:200-json-example",
          type: "json",
          route: "getUsers",
          delay: null,
          disabled: false,
          preview: {
            status: 200,
            body: [
              {
                success: true,
                firstName: "Joe",
                lastName: "Doe",
                email: "joe.doe@example.com",
                role: "developer",
              },
            ],
          },
        },

        {
          id: "getUsers:418-text-example",
          type: "text",
          route: "getUsers",
          delay: null,
          disabled: false,
          preview: {
            status: 418,
            body: "I'm",
          },
        },

        {
          id: "getUsers:500-text-example",
          type: "text",
          route: "getUsers",
          delay: null,
          disabled: false,
          preview: {
            status: 500,
            body: "internal server error",
          },
        },
        {
          id: "getUser:200-json-example",
          type: "json",
          route: "getUser",
          delay: null,
          disabled: false,
          preview: {
            status: 200,
            body: {
              success: true,
              firstName: "Joe",
              lastName: "Doe",
              email: "joe.doe@example.com",
              role: "developer",
            },
          },
        },
        {
          id: "getUser:404-json-example",
          type: "json",
          route: "getUser",
          delay: null,
          disabled: false,
          preview: {
            status: 404,
            body: {
              code: 404,
              message: "Not found",
            },
          },
        },
        {
          id: "getUser:406-json-example",
          type: "json",
          route: "getUser",
          delay: null,
          disabled: false,
          preview: {
            status: 406,
            body: [406],
          },
        },
      ]);
    });
  });
});
