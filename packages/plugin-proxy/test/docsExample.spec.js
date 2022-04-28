const { startServer, fetch, waitForServer, waitForHost, startHost } = require("./support/helpers");

describe("Docs example", () => {
  let server, host;

  beforeAll(async () => {
    host = await startHost();
    server = await startServer("docs-example");
    await waitForHost();
    await waitForServer();
  });

  afterAll(async () => {
    await host.stop();
    await server.stop();
  });

  describe("get /users", () => {
    it("should return users from host", async () => {
      const response = await fetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });

  describe("get /users/2", () => {
    it("should return second user from host", async () => {
      const response = await fetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });
  });
});
