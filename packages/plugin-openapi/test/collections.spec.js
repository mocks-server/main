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

    describe("collections", () => {
      it("should have created collections with routes from openapi definition", async () => {
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
          {
            id: "openapi",
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

    it("should have omitted routes without any variant in collecetions", async () => {
      expect(server.mock.collections.plain).toEqual([
        {
          id: "users",
          from: null,
          definedRoutes: ["post-users:201-status", "get-users-id:200-json-success"],
          routes: ["post-users:201-status", "get-users-id:200-json-success"],
        },
        {
          id: "openapi",
          from: null,
          definedRoutes: ["post-users:201-status", "get-users-id:200-json-success"],
          routes: ["post-users:201-status", "get-users-id:200-json-success"],
        },
      ]);
    });
  });

  describe("default collection", () => {
    beforeAll(async () => {
      server = await startServer("multiple-definitions", {
        mock: {
          collections: {
            selected: "openapi",
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should include routes from all OpenAPI definitions", async () => {
      expect(server.mock.collections.plain).toEqual([
        {
          id: "openapi",
          from: null,
          definedRoutes: [
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
            "read-users:one-user",
            "create-user:success",
            "read-user:success",
          ],
          routes: [
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
            "read-users:one-user",
            "create-user:success",
            "read-user:success",
          ],
        },
      ]);
    });
  });

  describe("when default collection ID is set to null", () => {
    beforeAll(async () => {
      server = await startServer("api-users-collection", {
        mock: {
          collections: {
            selected: "users",
          },
        },
        plugins: {
          openapi: {
            collection: {
              id: null,
            },
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should have not created default collection", async () => {
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

  describe("when default collection ID is set in config", () => {
    beforeAll(async () => {
      server = await startServer("api-users-collection", {
        mock: {
          collections: {
            selected: "users",
          },
        },
        plugins: {
          openapi: {
            collection: {
              id: "custom-collection",
            },
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should have set collection id", async () => {
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
        {
          id: "custom-collection",
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

  describe("when default collection extends from another collection", () => {
    beforeAll(async () => {
      server = await startServer("api-users-collection-from", {
        mock: {
          collections: {
            selected: "openapi",
          },
        },
        plugins: {
          openapi: {
            collection: {
              from: "users",
            },
          },
        },
      });
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should include routes from the other collection and have the from property", async () => {
      expect(server.mock.collections.plain).toEqual([
        {
          id: "base",
          from: null,
          definedRoutes: ["get-books:success"],
          routes: ["get-books:success"],
        },
        {
          id: "users",
          from: "base",
          definedRoutes: [
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
          ],
          routes: [
            "get-books:success",
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
          ],
        },
        {
          id: "openapi",
          from: "users",
          definedRoutes: [
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
          ],
          routes: [
            "get-books:success",
            "get-users:200-json-one-user",
            "post-users:201-status",
            "get-users-id:200-json-success",
          ],
        },
      ]);
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

    describe("get-books route", () => {
      it("should be also available", async () => {
        const response = await fetchJson("/api/books");
        expect(response.body).toEqual([
          {
            title: "1984",
            author: "George Orwell",
          },
        ]);
        expect(response.status).toEqual(200);
      });
    });
  });
});
