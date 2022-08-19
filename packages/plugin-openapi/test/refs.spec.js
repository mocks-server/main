import { startServer, fetchJson, fetchText, waitForServer } from "./support/helpers";

describe("when openapi has refs", () => {
  let server;

  function testValidRefs(fixture) {
    describe(`when fixture is ${fixture}`, () => {
      beforeAll(async () => {
        server = await startServer(fixture, {
          log: "debug",
        });
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
              variants: ["get-users:200-json-one-user", "get-users:200-json-two-users"],
            },
            {
              id: "post-users",
              url: "/api/users",
              method: "post",
              delay: null,
              variants: ["post-users:201-status", "post-users:400-text-error-message"],
            },
            {
              id: "get-users-id",
              url: "/api/users/:id",
              method: "get",
              delay: null,
              variants: ["get-users-id:200-json-success", "get-users-id:404-json-not-found"],
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
  }

  testValidRefs("refs");
  testValidRefs("refs-files");

  describe("when fixture has wrong refs", () => {
    beforeAll(async () => {
      server = await startServer("wrong-refs");
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    describe("routes", () => {
      it("should have created routes from openapi document defined in files", async () => {
        expect(server.mock.routes.plain).toEqual([
          {
            id: "get-users-id",
            url: "/api/users/:id",
            method: "get",
            delay: null,
            variants: ["get-users-id:200-json-success", "get-users-id:404-json-not-found"],
          },
        ]);
      });
    });

    describe("alerts", () => {
      it("should have added an alert about wrong refs", async () => {
        const alert =
          server.alerts.find((serverAlert) => serverAlert.id.includes("openapi")) || {};
        expect(alert.id).toEqual("plugins:openapi:documents:0");
        expect(alert.message).toEqual("Error resolving openapi $ref");
        expect(alert.error.message).toEqual(
          "JSON Pointer points to missing location: #/componednts/pathItems/Users"
        );
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

  describe("when location option is set wrongly", () => {
    beforeAll(async () => {
      server = await startServer("wrong-refs-options");
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    describe("routes", () => {
      it("should have created routes from openapi document defined in files", async () => {
        expect(server.mock.routes.plain).toEqual([]);
      });
    });

    describe("alerts", () => {
      it("should have added an alert about wrong openapi", async () => {
        const alert =
          server.alerts.find((serverAlert) => serverAlert.id.includes("openapi")) || {};
        expect(alert.id).toEqual("plugins:openapi:documents:0");
        expect(alert.message).toEqual("Error loading openapi definition");
        expect(alert.error.message).toEqual(
          "options.subDocPath must be an Array of path segments or a valid JSON Pointer"
        );
      });
    });
  });
});
