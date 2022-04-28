const {
  startServer,
  fetch,
  TimeCounter,
  waitForServer,
  waitForHost,
  startHost,
} = require("./support/helpers");

describe("when using delay option in variant", () => {
  let server, host;

  beforeAll(async () => {
    host = await startHost();
    server = await startServer("delay");
    await waitForHost();
    await waitForServer();
  });

  afterAll(async () => {
    await host.stop();
    await server.stop();
  });

  describe("get /users", () => {
    it("should return users from host after 1 second", async () => {
      const timeCounter = new TimeCounter();
      const response = await fetch("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(999);
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
    it("should return second user from host after 1 second", async () => {
      const timeCounter = new TimeCounter();
      const response = await fetch("/api/users/2");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(999);
      expect(response.body).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });
  });
});
