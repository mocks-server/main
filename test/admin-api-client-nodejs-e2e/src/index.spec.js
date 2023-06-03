const { wait } = require("./support/helpers");

const { AdminApiClient } = require("@mocks-server/admin-api-client");

const adminApiClient = new AdminApiClient();

adminApiClient.configClient({
  port: 3110,
});

describe("admin api client methods", () => {
  describe("when reading about", () => {
    it("should return current version", async () => {
      const about = await adminApiClient.readAbout();
      expect(about.versions.adminApi).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    describe("when there are alerts", () => {
      it("should return alerts", async () => {
        const alerts = await adminApiClient.readAlerts();
        expect(alerts.length).toEqual(1);
      });

      it("should return alert about collection not defined", async () => {
        const alerts = await adminApiClient.readAlerts();
        expect(alerts[0].message).toEqual(
          expect.stringContaining("Option 'mock.collections.selected' was not defined")
        );
      });
    });

    describe("when there are alerts about files with error", () => {
      it("should return 3 alerts", async () => {
        expect.assertions(1);
        await adminApiClient.updateConfig({
          files: { path: "mocks-with-error" },
        });
        await wait(2000);
        const alerts = await adminApiClient.readAlerts();
        expect(alerts.length).toEqual(3);
      });

      it("alert about config should exist", async () => {
        const alerts = await adminApiClient.readAlerts();
        const alertId = alerts[0].id;
        const alert = await adminApiClient.readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(
          expect.stringContaining("Option 'mock.collections.selected' was not defined")
        );
      });

      it("alert about empty collections should exist", async () => {
        const alerts = await adminApiClient.readAlerts();
        const alertId = alerts[1].id;
        const alert = await adminApiClient.readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("No collections found"));
      });

      it("alert about files error should exist", async () => {
        const alerts = await adminApiClient.readAlerts();
        const alertId = alerts[2].id;
        const alert = await adminApiClient.readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("Error loading file"));
      });
    });

    describe("when alerts are removed", () => {
      it("should return no alerts", async () => {
        await adminApiClient.updateConfig({
          files: { path: "mocks" },
          mock: {
            collections: {
              selected: "base",
            },
          },
        });
        await wait(2000);
        const alerts = await adminApiClient.readAlerts();
        expect(alerts.length).toEqual(0);
      });
    });
  });

  describe("when updating config", () => {
    it("should update current delay", async () => {
      await adminApiClient.updateConfig({
        mock: {
          routes: {
            delay: 2000,
          },
        },
      });
      const settings = await adminApiClient.readConfig();
      expect(settings.mock.routes.delay).toEqual(2000);
    });
  });

  describe("when reading collections", () => {
    it("should return collections", async () => {
      const collections = await adminApiClient.readCollections();
      expect(collections).toEqual([
        {
          id: "base",
          from: null,
          definedRoutes: ["get-user:1"],
          routes: ["get-user:1"],
        },
        {
          id: "user2",
          from: null,
          definedRoutes: ["get-user:2"],
          routes: ["get-user:2"],
        },
      ]);
    });
  });

  describe("when reading collection", () => {
    it("should return collection data", async () => {
      const collection = await adminApiClient.readCollection("base");
      expect(collection).toEqual({
        id: "base",
        from: null,
        definedRoutes: ["get-user:1"],
        routes: ["get-user:1"],
      });
    });
  });

  describe("when reading routes", () => {
    it("should return routes", async () => {
      const data = await adminApiClient.readRoutes();
      expect(data).toEqual([
        {
          id: "get-user",
          delay: null,
          url: "/api/user",
          method: ["get"],
          variants: ["get-user:1", "get-user:2"],
        },
      ]);
    });
  });

  describe("when reading route", () => {
    it("should return route data", async () => {
      const data = await adminApiClient.readRoute("get-user");
      expect(data).toEqual({
        id: "get-user",
        delay: null,
        url: "/api/user",
        method: ["get"],
        variants: ["get-user:1", "get-user:2"],
      });
    });
  });

  describe("when reading variants", () => {
    it("should return route variants", async () => {
      const data = await adminApiClient.readVariants();
      expect(data).toEqual([
        {
          id: "get-user:1",
          route: "get-user",
          disabled: false,
          type: "json",
          preview: { body: [{ email: "foo@foo.com" }], status: 200 },
          delay: null,
        },
        {
          id: "get-user:2",
          route: "get-user",
          disabled: false,
          type: "json",
          preview: { body: [{ email: "foo2@foo2.com" }], status: 200 },
          delay: null,
        },
      ]);
    });
  });

  describe("when reading variant", () => {
    it("should return variant data", async () => {
      const data = await adminApiClient.readVariant("get-user:2");
      expect(data).toEqual({
        id: "get-user:2",
        route: "get-user",
        type: "json",
        disabled: false,
        preview: { body: [{ email: "foo2@foo2.com" }], status: 200 },
        delay: null,
      });
    });
  });

  describe("custom route variants", () => {
    it("should be empty", async () => {
      const data = await adminApiClient.readCustomRouteVariants();
      expect(data).toEqual([]);
    });

    it("should be able to add one", async () => {
      await adminApiClient.useRouteVariant("get-user:2");
      const data = await adminApiClient.readCustomRouteVariants();
      expect(data).toEqual([{ id: "get-user:2" }]);
    });

    it("should reject if route variant don't exist", async () => {
      expect.assertions(1);
      await adminApiClient.useRouteVariant("foo").catch((err) => {
        expect(err.message).toEqual('Route variant with id "foo" was not found');
      });
    });

    it("should be empty after restoring them to the collection defaults", async () => {
      await adminApiClient.restoreRouteVariants();
      const data = await adminApiClient.readCustomRouteVariants();
      expect(data).toEqual([]);
    });
  });
});
