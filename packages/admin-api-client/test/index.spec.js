import { wait, waitForServer } from "./support/helpers";

import {
  readAbout,
  readConfig,
  updateConfig,
  readAlerts,
  readAlert,
  readCollections,
  readCollection,
  readRoutes,
  readRoute,
  readVariants,
  readVariant,
  readCustomRouteVariants,
  useRouteVariant,
  restoreRouteVariants,
  configClient,
} from "../index";

describe("admin api client global methods", () => {
  describe("when reading about", () => {
    it("should return current version", async () => {
      const about = await readAbout();
      expect(about.versions.adminApi).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    describe("when there are alerts", () => {
      it("should return alerts", async () => {
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(1);
      });

      it("should return alert about collection not defined", async () => {
        const alerts = await readAlerts();
        expect(alerts[0].message).toEqual(
          expect.stringContaining("Option 'mock.collections.selected' was not defined")
        );
      });
    });

    describe("when there are alerts about files with error", () => {
      it("should return 3 alerts", async () => {
        expect.assertions(1);
        await updateConfig({
          files: { path: "mocks-with-error" },
        });
        await wait(2000);
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(3);
      });

      it("alert about config should exist", async () => {
        const alerts = await readAlerts();
        const alertId = alerts[0].id;
        const alert = await readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(
          expect.stringContaining("Option 'mock.collections.selected' was not defined")
        );
      });

      it("alert about empty collections should exist", async () => {
        const alerts = await readAlerts();
        const alertId = alerts[1].id;
        const alert = await readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("No collections found"));
      });

      it("alert about files error should exist", async () => {
        const alerts = await readAlerts();
        const alertId = alerts[2].id;
        const alert = await readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("Error loading collections"));
      });
    });

    describe("when alerts are removed", () => {
      it("should return no alerts", async () => {
        await updateConfig({
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

  describe("when updating config", () => {
    it("should update current delay using legacy option", async () => {
      await updateConfig({
        mocks: {
          delay: 1000,
        },
      });
      const settings = await readConfig();
      expect(settings.mocks.delay).toEqual(1000);
    });

    it("should update current delay", async () => {
      await updateConfig({
        mock: {
          routes: {
            delay: 2000,
          },
        },
      });
      const settings = await readConfig();
      expect(settings.mock.routes.delay).toEqual(2000);
    });
  });

  describe("when reading collections", () => {
    it("should return collections", async () => {
      const collections = await readCollections();
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
      const collection = await readCollection("base");
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
      const data = await readRoutes();
      expect(data).toEqual([
        {
          id: "get-user",
          delay: null,
          url: "/api/user",
          method: "get",
          variants: ["get-user:1", "get-user:2"],
        },
      ]);
    });
  });

  describe("when reading route", () => {
    it("should return route data", async () => {
      const data = await readRoute("get-user");
      expect(data).toEqual({
        id: "get-user",
        delay: null,
        url: "/api/user",
        method: "get",
        variants: ["get-user:1", "get-user:2"],
      });
    });
  });

  describe("when reading variants", () => {
    it("should return route variants", async () => {
      const data = await readVariants();
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
      const data = await readVariant("get-user:2");
      expect(data).toEqual({
        id: "get-user:2",
        route: "get-user",
        disabled: false,
        type: "json",
        preview: { body: [{ email: "foo2@foo2.com" }], status: 200 },
        delay: null,
      });
    });
  });

  describe("custom route variants", () => {
    it("should be empty", async () => {
      const data = await readCustomRouteVariants();
      expect(data).toEqual([]);
    });

    it("should be able to add one", async () => {
      await useRouteVariant("get-user:2");
      const data = await readCustomRouteVariants();
      expect(data).toEqual(["get-user:2"]);
    });

    it("should reject if route variant don't exist", async () => {
      expect.assertions(1);
      await useRouteVariant("foo").catch((err) => {
        expect(err.message).toEqual('Route variant with id "foo" was not found');
      });
    });

    it("should be empty after restoring them to the collection defaults", async () => {
      await restoreRouteVariants();
      const data = await readCustomRouteVariants();
      expect(data).toEqual([]);
    });
  });

  describe("when updating client config", () => {
    it("should update update client port", async () => {
      await updateConfig({
        plugins: {
          adminApi: {
            port: 3120,
          },
        },
      });
      await waitForServer(3120);
      configClient({
        port: 3120,
      });
      const settings = await readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });

    it("should do nothing if not port is provided", async () => {
      configClient();
      const settings = await readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });
  });
});
