const {
  readAbout,
  readMocks,
  readMock,
  readRoutes,
  readRoute,
  readRouteVariant,
  readSettings,
  updateSettings,
  readAlerts,
  readAlert,
} = require("./index");

describe("react-admin-client methods used through node", () => {
  describe("when reading about", () => {
    it("should return current version", async () => {
      const about = await readAbout();
      expect(about.version).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    it("should return two alerts", async () => {
      const alerts = await readAlerts();
      // Using legacy API produces an alert
      expect(alerts.length).toEqual(2);
    });

    it("alert model should exist", async () => {
      const alerts = await readAlerts();
      const alertId = alerts[0].id;
      const alert = await readAlert(alertId);
      expect(alert.id).toEqual(alertId);
    });
  });

  describe("when reading routes", () => {
    it("should return routes collection", async () => {
      const routes = await readRoutes();
      expect(routes.length).toEqual(1);
    });

    it("first route model should exist", async () => {
      const routes = await readRoutes();
      const routeId = routes[0].id;
      const route = await readRoute(routeId);
      expect(route.id).toEqual(routeId);
    });
  });

  describe("when reading mocks", () => {
    it("should return mocks collection", async () => {
      const mocks = await readMocks();
      expect(mocks.length).toEqual(2);
    });

    it("first mock model should exist", async () => {
      const mocks = await readMocks();
      const mockId = mocks[0].id;
      const mock = await readMock(mockId);
      expect(mock.id).toEqual(mockId);
    });

    it("second mock model should exist", async () => {
      const mocks = await readMocks();
      const mockId = mocks[1].id;
      const mock = await readMock(mockId);
      expect(mock.id).toEqual(mockId);
    });

    it("route variant of mock base should exist", async () => {
      const mocks = await readMocks();
      const routeVariantId = mocks[0].routesVariants[0];
      const routeVariant = await readRouteVariant(routeVariantId);
      expect(routeVariant.id).toEqual(routeVariantId);
    });

    it("first routeVariant of mock user2 should exist", async () => {
      const mocks = await readMocks();
      const routeVariantId = mocks[1].routesVariants[0];
      const routeVariant = await readRouteVariant(routeVariantId);
      expect(routeVariant.id).toEqual(routeVariantId);
    });
  });

  describe("when reading settings", () => {
    it("should return current mock", async () => {
      const settings = await readSettings();
      expect(settings.mocks.selected).toEqual(undefined);
    });
  });

  describe("when updating settings", () => {
    it("should update current mock", async () => {
      await updateSettings({
        mocks: { selected: "user2" },
      });
      const settings = await readSettings();
      expect(settings.mocks.selected).toEqual("user2");
    });

    it("should update current delay using legacy option", async () => {
      await updateSettings({
        mocks: {
          delay: 1000,
        },
      });
      const settings = await readSettings();
      expect(settings.mocks.delay).toEqual(1000);
    });

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

    it("should update current mock again", async () => {
      await updateSettings({
        mock: { collections: { selected: "base" } },
      });
      const settings = await readSettings();
      expect(settings.mock.collections.selected).toEqual("base");
    });
  });
});
