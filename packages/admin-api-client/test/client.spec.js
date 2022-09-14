import https from "https";
import { AdminApiClient } from "../src/index";

import {
  wait,
  waitForServer,
  createCertFiles,
  removeCertFiles,
  certFile,
  keyFile,
} from "./support/helpers";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("AdminApiClient class", () => {
  let apiClient;

  beforeAll(() => {
    apiClient = new AdminApiClient();
    apiClient.configClient({
      port: 3110,
      host: "127.0.0.1",
    });
  });

  describe("when reading about", () => {
    it("should return current version", async () => {
      const about = await apiClient.readAbout();
      expect(about.versions.adminApi).toBeDefined();
    });
  });

  describe("when reading alerts", () => {
    describe("when there are no alerts", () => {
      it("should return no alerts", async () => {
        await apiClient.updateConfig({
          mock: { collections: { selected: "user2" } },
        });
        await wait(1000);
        await apiClient.updateConfig({
          mock: { collections: { selected: "base" } },
        });
        await wait(3000);
        const alerts = await apiClient.readAlerts();
        expect(alerts.length).toEqual(0);
      });
    });

    describe("when there are alerts about files with error", () => {
      it("should return 2 alerts", async () => {
        expect.assertions(1);
        await apiClient.updateConfig({
          files: { path: "mocks-with-error" },
        });
        await wait(3000);
        const alerts = await apiClient.readAlerts();
        expect(alerts.length).toEqual(2);
      });

      it("alert about empty collections should exist", async () => {
        const alerts = await apiClient.readAlerts();
        const alertId = alerts[0].id;
        const alert = await apiClient.readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("No collections found"));
      });

      it("alert about files error should exist", async () => {
        const alerts = await apiClient.readAlerts();
        const alertId = alerts[1].id;
        const alert = await apiClient.readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("Error loading file"));
        expect(alert.message).toEqual(expect.stringContaining("collections.js"));
      });
    });

    describe("when alerts are removed", () => {
      it("should return no alerts", async () => {
        await apiClient.updateConfig({
          files: { path: "mocks" },
          mock: {
            collections: {
              selected: "base",
            },
          },
        });
        await wait(2000);
        const alerts = await apiClient.readAlerts();
        expect(alerts.length).toEqual(0);
      });
    });
  });

  describe("when updating config", () => {
    it("should update current delay", async () => {
      await apiClient.updateConfig({
        mock: {
          routes: {
            delay: 2000,
          },
        },
      });
      const settings = await apiClient.readConfig();
      expect(settings.mock.routes.delay).toEqual(2000);
    });
  });

  describe("when reading collections", () => {
    it("should return collections", async () => {
      const collections = await apiClient.readCollections();
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
      const collection = await apiClient.readCollection("base");
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
      const data = await apiClient.readRoutes();
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
      const data = await apiClient.readRoute("get-user");
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
      const data = await apiClient.readVariants();
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
      const data = await apiClient.readVariant("get-user:2");
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
      const data = await apiClient.readCustomRouteVariants();
      expect(data).toEqual([]);
    });

    it("should be able to add one", async () => {
      await apiClient.useRouteVariant("get-user:2");
      const data = await apiClient.readCustomRouteVariants();
      expect(data).toEqual(["get-user:2"]);
    });

    it("should reject if route variant don't exist", async () => {
      expect.assertions(1);
      await apiClient.useRouteVariant("foo").catch((err) => {
        expect(err.message).toEqual('Route variant with id "foo" was not found');
      });
    });

    it("should be empty after restoring them to the collection defaults", async () => {
      await apiClient.restoreRouteVariants();
      const data = await apiClient.readCustomRouteVariants();
      expect(data).toEqual([]);
    });
  });

  describe("when updating client port", () => {
    it("should update update client port", async () => {
      await apiClient.updateConfig({
        plugins: {
          adminApi: {
            port: 3120,
          },
        },
      });
      await waitForServer(3120);
      apiClient.configClient({
        port: 3120,
      });
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });

    it("should do nothing if not port is provided", async () => {
      apiClient.configClient();
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });

    it("should update update client port again", async () => {
      await apiClient.updateConfig({
        plugins: {
          adminApi: {
            port: 3110,
          },
        },
      });
      await waitForServer(3110);
      apiClient.configClient({
        port: 3110,
      });
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3110);
    });
  });

  describe("when updating client protocol", () => {
    beforeAll(async () => {
      await createCertFiles();
    });

    afterAll(() => {
      removeCertFiles();
    });

    it("should update client protocol", async () => {
      await apiClient.updateConfig({
        plugins: {
          adminApi: {
            port: 3120,
            https: {
              enabled: true,
              cert: certFile,
              key: keyFile,
            },
          },
        },
      });
      await waitForServer(3120, {
        protocol: "https",
      });
      apiClient.configClient({
        port: 3120,
        https: true,
        agent: httpsAgent,
      });
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });

    it("should do nothing if no protocol is provided", async () => {
      apiClient.configClient();
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3120);
    });

    it("should update update client protocol again", async () => {
      await apiClient.updateConfig({
        plugins: {
          adminApi: {
            port: 3110,
            https: {
              enabled: false,
            },
          },
        },
      });
      await waitForServer(3110);
      apiClient.configClient({
        port: 3110,
        https: false,
        agent: null,
      });
      const settings = await apiClient.readConfig();
      expect(settings.plugins.adminApi.port).toEqual(3110);
    });
  });
});
