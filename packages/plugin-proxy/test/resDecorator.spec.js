const { startServer, fetch, waitForServer, waitForHost, startHost } = require("./support/helpers");

describe("when using filter option", () => {
  let server, host;

  beforeAll(async () => {
    host = await startHost();
    server = await startServer("res-decorator");
    await waitForHost();
    await waitForServer();
  });

  afterAll(async () => {
    await host.stop();
    await server.stop();
  });

  describe("get /users", () => {
    it("should return modified users from host", async () => {
      const response = await fetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "Modified John Doe",
        },
        {
          id: 2,
          name: "Modified Jane Doe",
        },
      ]);
    });
  });

  describe("get /users/2", () => {
    it("should return second user from host", async () => {
      const response = await fetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Modified Jane Doe",
      });
    });
  });
});
