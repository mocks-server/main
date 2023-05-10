import { startServer, fetchJson, fetchText, waitForServer } from "./support/helpers";

describe("generated routes", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("api-multiple-params");
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
          variants: ["get-users-id:200-json-success", "get-users-id:404-json-not-found"],
        },
        {
          id: "get-users-id-books-bookId",
          url: "/api/users/:id/books/:bookId",
          method: ["get"],
          delay: null,
          variants: ["get-users-id-books-bookId:200-json-success"],
        },
        {
          id: "get-users-id-books-bookId-pages-pageNumber",
          url: "/api/users/:id/books/:bookId/pages/:pageNumber",
          method: ["get"],
          delay: null,
          variants: ["get-users-id-books-bookId-pages-pageNumber:200-text-success"],
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
  });

  describe("post-users route", () => {
    it("should have 201-status variant available in base collection", async () => {
      const response = await fetchJson("/api/users", {
        method: "POST",
      });
      expect(response.body).toBe(undefined);
      expect(response.status).toEqual(201);
    });
  });

  describe("get-users-id route", () => {
    it("should have 200-json-success variant available in base collection", async () => {
      const response = await fetchJson("/api/users/2");
      expect(response.body).toEqual({
        id: 1,
        name: "John Doe",
      });
      expect(response.status).toEqual(200);
    });
  });

  describe("get-users-id-books-bookId route", () => {
    it("should have 200-json-success variant available in base collection", async () => {
      const response = await fetchJson("/api/users/2/books/3");
      expect(response.body).toEqual({
        id: 1,
        title: "1984",
      });
      expect(response.status).toEqual(200);
    });
  });

  describe("get-users-id-books-bookId-pages-pageNumber route", () => {
    it("should have 200-text-success variant available in base collection", async () => {
      const response = await fetchText("/api/users/2/books/3/pages/4");
      expect(response.body).toEqual("Page of the book 1984 by George Orwell.");
      expect(response.status).toEqual(200);
    });
  });
});
