const { wait } = require("./support/helpers");

const {
  readAbout,
  readSettings,
  updateSettings,
  readAlerts,
  readAlert,
  readMocks,
  readMock,
  readRoutes,
  readRoute,
  readRoutesVariants,
  readRouteVariant,
  readCustomRoutesVariants,
  useRouteVariant,
  restoreRoutesVariants,
} = require("@mocks-server/admin-api-client");

describe("react-admin-client methods used with node", () => {
  describe("when reading about", () => {
    it("should return current version", async () => {
      const about = await readAbout();
      expect(about.version).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    describe("when there are alerts", () => {
      it("should return alerts", async () => {
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(1);
      });

      it("should return alert about mock not defined", async () => {
        const alerts = await readAlerts();
        expect(alerts[0].message).toEqual(
          expect.stringContaining("Option 'mock' was not defined")
        );
      });
    });

    describe("when there are alerts about files with error", () => {
      it("should return alerts array", async () => {
        expect.assertions(1);
        await updateSettings({
          files: { path: "mocks-with-error" },
        });
        await wait(2000);
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(3);
      });

      it("alert about files error should exist", async () => {
        const alerts = await readAlerts();
        const alertId = alerts[2].id;
        const alert = await readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("Error loading mocks"));
      });
    });

    describe("when alerts are removed", () => {
      it("should return no alerts", async () => {
        await updateSettings({
          files: { path: "mocks" },
          mock: {
            collections: {
              selected: "base",
            },
          },
        });
        await wait(2000);
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(0);
      });
    });
  });

  describe("when updating settings", () => {
    it("should update current delay", async () => {
      await updateSettings({
        mock: {
          routes: {
            delay: 1000,
          },
        },
      });
      const settings = await readSettings();
      expect(settings.mock.routes.delay).toEqual(1000);
    });
  });

  describe("when reading mocks", () => {
    it("should return mocks", async () => {
      const mocks = await readMocks();
      expect(mocks).toEqual([
        {
          id: "base",
          from: null,
          routesVariants: ["get-user:1"],
          appliedRoutesVariants: ["get-user:1"],
        },
        {
          id: "user2",
          from: null,
          routesVariants: ["get-user:2"],
          appliedRoutesVariants: ["get-user:2"],
        },
      ]);
    });
  });

  describe("when reading mock", () => {
    it("should return mock data", async () => {
      const mock = await readMock("base");
      expect(mock).toEqual({
        id: "base",
        from: null,
        routesVariants: ["get-user:1"],
        appliedRoutesVariants: ["get-user:1"],
      });
    });
  });

  describe("when reading routes", () => {
    it("should return routes", async () => {
      const data = await readRoutes();
      expect(data).toEqual([
        {
          id: "get-user",
          delay: null,
          url: "/api/user",
          method: "GET",
          variants: ["get-user:1", "get-user:2"],
        },
      ]);
    });
  });

  describe("when reading route", () => {
    it("should return route data", async () => {
      const mock = await readRoute("get-user");
      expect(mock).toEqual({
        id: "get-user",
        delay: null,
        url: "/api/user",
        method: "GET",
        variants: ["get-user:1", "get-user:2"],
      });
    });
  });

  describe("when reading routes variants", () => {
    it("should return routes variants", async () => {
      const data = await readRoutesVariants();
      expect(data).toEqual([
        {
          id: "get-user:1",
          routeId: "get-user",
          handler: "json",
          response: { body: [{ email: "foo@foo.com" }], status: 200 },
          delay: null,
        },
        {
          id: "get-user:2",
          routeId: "get-user",
          handler: "json",
          response: { body: [{ email: "foo2@foo2.com" }], status: 200 },
          delay: null,
        },
      ]);
    });
  });

  describe("when reading route variant", () => {
    it("should return route variant data", async () => {
      const data = await readRouteVariant("get-user:2");
      expect(data).toEqual({
        id: "get-user:2",
        routeId: "get-user",
        handler: "json",
        response: { body: [{ email: "foo2@foo2.com" }], status: 200 },
        delay: null,
      });
    });
  });

  describe("mock custom route variants", () => {
    it("should be empty", async () => {
      const data = await readCustomRoutesVariants();
      expect(data).toEqual([]);
    });

    it("should be able to add one", async () => {
      await useRouteVariant("get-user:2");
      const data = await readCustomRoutesVariants();
      expect(data).toEqual(["get-user:2"]);
    });

    it("should reject if route variant don't exist", async () => {
      expect.assertions(1);
      await useRouteVariant("foo").catch((err) => {
        expect(err.message).toEqual('Route variant with id "foo" was not found');
      });
    });

    it("should be empty after restoring them to the mock defaults", async () => {
      await restoreRoutesVariants();
      const data = await readCustomRoutesVariants();
      expect(data).toEqual([]);
    });
  });
});
