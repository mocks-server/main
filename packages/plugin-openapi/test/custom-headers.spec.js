import { startServer, fetchJson, fetchText, waitForServer } from "./support/helpers";

describe("when openapi response has headers", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("custom-headers");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("routes", () => {
    it("should have created routes from openapi document defined in files", async () => {
      expect(server.mock.routes.plain).toEqual([
        {
          id: "read-users",
          url: "/api/users",
          method: ["get"],
          delay: null,
          variants: ["read-users:one-user", "read-users:two-users"],
        },
        {
          id: "create-user",
          url: "/api/users",
          method: ["post"],
          delay: null,
          variants: ["create-user:success", "create-user:error"],
        },
      ]);
    });
  });

  describe("get-users route", () => {
    it("should have response headers in base collection", async () => {
      const response = await fetchJson("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
      ]);
      expect(response.status).toEqual(200);
      expect(response.headers.get("x-custom-header-read-users")).toEqual("read-users-value");
      expect(response.headers.get("Content-Type")).toEqual("application/json; charset=utf-8");
    });

    it("should have response headers in all-users collection", async () => {
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
      expect(response.headers.get("x-custom-header-read-users")).toEqual("read-users-value");
      expect(response.headers.get("Content-Type")).toEqual("application/json; charset=utf-8");
    });
  });

  describe("post-users route", () => {
    it("should have response headers in all-users collection", async () => {
      const response = await fetchJson("/api/users", {
        method: "POST",
      });
      expect(response.body).toBe(undefined);
      expect(response.status).toEqual(201);
      expect(response.headers.get("x-custom-header-create-user")).toEqual("create-user-value");
      expect(response.headers.get("x-custom-header-create-user-2")).toEqual("create-user-value-2");
      expect(response.headers.get("Content-Type")).toEqual(null);
    });

    it("should have text/html header in users-error collection", async () => {
      await server.mock.collections.select("users-error", { check: true });
      const response = await fetchText("/api/users", {
        method: "POST",
      });
      expect(response.body).toEqual("<div>Error</div>");
      expect(response.status).toEqual(400);
      expect(response.headers.get("Content-Type")).toEqual("text/html; charset=utf-8");
    });
  });
});
