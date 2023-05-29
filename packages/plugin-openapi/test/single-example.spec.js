import { startServer, waitForServer } from "./support/helpers";

describe("when openapi has only a single example for a response", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("single-example");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("routes", () => {
    it("should have created routes from openapi document defined in files", async () => {
      expect(server.mock.routes.plain).toEqual([
        {
          id: "get-users",
          url: "/api/users",
          method: "get",
          delay: null,
          variants: ["get-users:200-json-example"],
        },
        {
          id: "post-users",
          url: "/api/users",
          method: "post",
          delay: null,
          variants: ["post-users:201-json-example", "post-users:400-text-example"],
        },
        {
          id: "get-users-id",
          url: "/api/users/:id",
          method: "get",
          delay: null,
          variants: ["get-users-id:404-json-example"],
        },
      ]);
    });
  });
});
