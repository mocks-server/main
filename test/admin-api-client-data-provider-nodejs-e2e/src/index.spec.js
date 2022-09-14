const {
  readAbout,
  readCollections,
  readCollection,
  readRoutes,
  readRoute,
  readVariant,
  readConfig,
  updateConfig,
  readAlerts,
  readAlert,
} = require("./index");

describe("data provider methods used through node", () => {
  describe("when reading about", () => {
    it("should return current versions", async () => {
      const about = await readAbout();
      expect(about.versions).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    it("should return one alert", async () => {
      const alerts = await readAlerts();
      expect(alerts.length).toEqual(1);
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

  describe("when reading collections", () => {
    it("should return collections", async () => {
      const collections = await readCollections();
      expect(collections.length).toEqual(2);
    });

    it("first collections model should exist", async () => {
      const collections = await readCollections();
      const collectionId = collections[0].id;
      const collection = await readCollection(collectionId);
      expect(collection.id).toEqual(collectionId);
    });

    it("second collection model should exist", async () => {
      const collections = await readCollections();
      const collectionId = collections[1].id;
      const mock = await readCollection(collectionId);
      expect(mock.id).toEqual(collectionId);
    });

    it("route route variant of collection base should exist", async () => {
      const collections = await readCollections();
      const routeVariantId = collections[0].routes[0];
      const routeVariant = await readVariant(routeVariantId);
      expect(routeVariant.id).toEqual(routeVariantId);
    });

    it("first route variant of collection user2 should exist", async () => {
      const collections = await readCollections();
      const routeVariantId = collections[1].routes[0];
      const routeVariant = await readVariant(routeVariantId);
      expect(routeVariant.id).toEqual(routeVariantId);
    });
  });

  describe("when reading config", () => {
    it("should return current collection", async () => {
      const config = await readConfig();
      expect(config.mock.collections.selected).toEqual(undefined);
    });
  });

  describe("when updating config", () => {
    it("should update current collection", async () => {
      await updateConfig({
        mock: { collections: { selected: "user2" } },
      });
      const config = await readConfig();
      expect(config.mock.collections.selected).toEqual("user2");
    });

    it("should update current delay", async () => {
      await updateConfig({
        mock: {
          routes: {
            delay: 1000,
          },
        },
      });
      const config = await readConfig();
      expect(config.mock.routes.delay).toEqual(1000);
    });

    it("should update current collection again", async () => {
      await updateConfig({
        mock: { collections: { selected: "base" } },
      });
      const config = await readConfig();
      expect(config.mock.collections.selected).toEqual("base");
    });
  });
});
