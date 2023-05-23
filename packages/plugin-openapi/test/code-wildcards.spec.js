import { startServer, fetchJson, fetchText, waitForServer } from "./support/helpers";

describe("when openapi codes include have wildcards", () => {
  let server;

  describe("when fixture is api-users", () => {
    beforeAll(async () => {
      server = await startServer("code-wildcards");
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
            method: ["get"],
            delay: null,
            variants: ["get-users:200-json-one-user", "get-users:200-json-two-users"],
          },
          {
            id: "post-users",
            url: "/api/users",
            method: ["post"],
            delay: null,
            variants: ["post-users:201-status", "post-users:400-text-error-message"],
          },
          {
            id: "get-users-id",
            url: "/api/users/:id",
            method: ["get"],
            delay: null,
            variants: ["get-users-id:404-json-not-found", "get-users-id:200-json-success"],
          },
        ]);
      });
    });

    describe("get-users route", () => {
      it("should have 200-json-one-user variant available in base collection", async () => {
        const response = await fetchJson("/api/users");
        expect(response.body).toEqual([
          {
            id: 1,
            name: "John Doe",
          },
        ]);
        expect(response.status).toEqual(200);
      });

      it("should have 200-json-two-users variant available in all-users collection", async () => {
        await server.mock.collections.select("all-users", { check: true });
        const response = await fetchJson("/api/users");
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
        expect(response.status).toEqual(200);
      });
    });

    describe("post-users route", () => {
      it("should have 201-status variant available in all-users collection", async () => {
        const response = await fetchJson("/api/users", {
          method: "POST",
        });
        expect(response.body).toBe(undefined);
        expect(response.status).toEqual(201);
      });

      it("should have 400-text-error-message variant available in users-error collection", async () => {
        await server.mock.collections.select("users-error", { check: true });
        const response = await fetchText("/api/users", {
          method: "POST",
        });
        expect(response.body).toBe("Bad data");
        expect(response.status).toEqual(400);
      });
    });

    describe("get-users-id route", () => {
      it("should have 200-json-success variant available in base collection", async () => {
        await server.mock.collections.select("base", { check: true });
        const response = await fetchJson("/api/users/2");
        expect(response.body).toEqual({
          id: 1,
          name: "John Doe",
        });
        expect(response.status).toEqual(200);
      });

      it("should have 200-json-two-users variant available in users-error collection", async () => {
        await server.mock.collections.select("users-error", { check: true });
        const response = await fetchJson("/api/users/2");
        expect(response.body).toEqual({
          code: 404,
          message: "Not found",
        });
        expect(response.status).toEqual(404);
      });
    });
  });
});
