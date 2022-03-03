const {
  startServer,
  fetch,
  waitForServer,
  waitForHost,
  waitForHost2,
  startHost,
  startHost2,
} = require("./support/helpers");

describe("when defining host option as a function", () => {
  let server, host, host2;

  beforeAll(async () => {
    host = await startHost();
    host2 = await startHost2();
    server = await startServer("host-function");
    await waitForHost();
    await waitForHost2();
    await waitForServer();
  });

  afterAll(async () => {
    await host.stop();
    await host2.stop();
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

  describe("get /users/1", () => {
    it("should return user from second host", async () => {
      const response = await fetch("/api/users/1");
      expect(response.body).toEqual({
        id: 1,
        name: "John Doe 2",
      });
    });
  });

  describe("get /users/2", () => {
    it("should return user from second host", async () => {
      const response = await fetch("/api/users/2");
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe 2",
      });
    });
  });
});
