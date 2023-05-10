import { startServer, waitForServer } from "./support/helpers";

describe("when openapi has not enough properties", () => {
  let server;

  describe("when openapi has no paths property", () => {
    beforeAll(async () => {
      server = await startServer("no-paths");
      await waitForServer();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("should have not created routes from openapi document defined in files", async () => {
      expect(server.mock.routes.plain).toEqual([]);
    });
  });

  function checkOnlyUsersIdRouteIsAvailable(description, fixture) {
    describe(`when openapi ${description}`, () => {
      beforeAll(async () => {
        server = await startServer(fixture);
        await waitForServer();
      });

      afterAll(async () => {
        await server.stop();
      });

      it("should omit not valid routes", async () => {
        expect(server.mock.routes.plain).toEqual([
          {
            id: "get-users-id",
            url: "/users/:id",
            method: ["get"],
            delay: null,
            variants: ["get-users-id:200-json-success", "get-users-id:404-json-not-found"],
          },
        ]);
      });
    });
  }

  checkOnlyUsersIdRouteIsAvailable("path is empty", "empty-path");
  checkOnlyUsersIdRouteIsAvailable("method is empty", "empty-method");
  checkOnlyUsersIdRouteIsAvailable("method responses is empty", "empty-responses");
  checkOnlyUsersIdRouteIsAvailable("response code is empty", "empty-response");
  checkOnlyUsersIdRouteIsAvailable("response media is empty", "empty-media");
  checkOnlyUsersIdRouteIsAvailable("response media is unknown", "unknown-media");
  checkOnlyUsersIdRouteIsAvailable("response media examples is empty", "empty-examples");
  checkOnlyUsersIdRouteIsAvailable(
    "response media example or example value is empty",
    "empty-example"
  );
});
