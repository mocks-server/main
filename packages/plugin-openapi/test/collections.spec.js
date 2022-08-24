import { startServer, fetchJson, waitForServer } from "./support/helpers";

describe("generated collections", () => {
  let server;

  describe("when collection id is provided in definition", () => {
    beforeAll(async () => {
      server = await startServer("api-users-collection", {
        mock: {
          collections: {
            selected: "users",
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    describe("routes", () => {
      it("should have created routes from openapi definition", async () => {
        expect(server.mock.collections.plain).toEqual([
          {
            id: "users",
            from: null,
            definedRoutes: [
              "get-users:200-json-one-user",
              "post-users:201-status",
              "get-users-id:200-json-success",
            ],
            routes: [
              "get-users:200-json-one-user",
              "post-users:201-status",
              "get-users-id:200-json-success",
            ],
          },
        ]);
      });
    });

    describe("get-users route", () => {
      it("should have 200-json-one-user variant available in users collection", async () => {
        const response = await fetchJson("/api/users");
        expect(response.body).toEqual([
          {
            id: 1,
            name: "John Doe",
          },
        ]);
        expect(response.status).toEqual(200);
      });
    });

    describe("post-users route", () => {
      it("should have 201-status variant available in users collection", async () => {
        const response = await fetchJson("/api/users", {
          method: "POST",
        });
        expect(response.body).toBe(undefined);
        expect(response.status).toEqual(201);
      });
    });

    describe("get-users-id route", () => {
      it("should have 200-json-success variant available in users collection", async () => {
        const response = await fetchJson("/api/users/2");
        expect(response.body).toEqual({
          id: 1,
          name: "John Doe",
        });
        expect(response.status).toEqual(200);
      });
    });
  });

  describe("when route has no variants", () => {
    beforeAll(async () => {
      server = await startServer("api-users-collection-no-variants", {
        log: "debug",
        mock: {
          collections: {
            selected: "users",
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    describe("routes", () => {
      it("should have omitted routes without any variant", async () => {
        expect(server.mock.collections.plain).toEqual([
          {
            id: "users",
            from: null,
            definedRoutes: ["post-users:201-status", "get-users-id:200-json-success"],
            routes: ["post-users:201-status", "get-users-id:200-json-success"],
          },
        ]);
      });
    });
  });
});
