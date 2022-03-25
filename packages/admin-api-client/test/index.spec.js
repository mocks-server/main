import { wait } from "./support/helpers";

import {
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
  // legacy
  readBehaviors,
  readBehavior,
  readFixtures,
  readFixture,
} from "../index";

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
        expect(alerts.length).toEqual(2);
      });

      it("should return alert about legacy usage", async () => {
        const alerts = await readAlerts();
        expect(alerts[0].message).toEqual(expect.stringContaining("Legacy mocks enabled"));
      });

      it("should return alert about mock not defined", async () => {
        const alerts = await readAlerts();
        expect(alerts[1].message).toEqual(
          expect.stringContaining('Option "mock" was not defined')
        );
      });
    });

    describe("when there are alerts about files with error", () => {
      it("should return alerts array", async () => {
        expect.assertions(1);
        await updateSettings({
          path: "mocks-with-error",
        });
        await wait(2000);
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(6);
      });

      it("alert about files error should exist", async () => {
        const alerts = await readAlerts();
        const alertId = alerts[5].id;
        const alert = await readAlert(alertId);
        expect(alert.id).toEqual(alertId);
        expect(alert.message).toEqual(expect.stringContaining("Error loading mocks"));
      });
    });

    describe("when alerts are removed", () => {
      it("should return only one alert about legacy usage", async () => {
        await updateSettings({
          path: "mocks",
          mock: "base",
        });
        await wait(2000);
        const alerts = await readAlerts();
        expect(alerts.length).toEqual(1);
      });
    });
  });

  describe("when reading fixtures", () => {
    it("should return current fixtures collection", async () => {
      const fixtures = await readFixtures();
      expect(fixtures.length).toEqual(2);
    });

    it("first fixture model should exist", async () => {
      const fixtures = await readFixtures();
      const fixtureId = fixtures[0].id;
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });

    it("second fixture model should exist", async () => {
      const fixtures = await readFixtures();
      const fixtureId = fixtures[1].id;
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });
  });

  describe("when reading behaviors", () => {
    it("should return behaviors collection", async () => {
      const behaviors = await readBehaviors();
      expect(behaviors.length).toEqual(2);
    });

    it("first behavior model should exist", async () => {
      const behaviors = await readBehaviors();
      const behaviorName = behaviors[0].name;
      const behavior = await readBehavior(behaviorName);
      expect(behavior.name).toEqual(behaviorName);
    });

    it("second behavior model should exist", async () => {
      const behaviors = await readBehaviors();
      const behaviorName = behaviors[1].name;
      const behavior = await readBehavior(behaviorName);
      expect(behavior.name).toEqual(behaviorName);
    });

    it("fixture of behavior base should exist", async () => {
      const behaviors = await readBehaviors();
      const fixtureId = behaviors[0].fixtures[0];
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });

    it("first fixture of behavior user2 should exist", async () => {
      const behaviors = await readBehaviors();
      const fixtureId = behaviors[1].fixtures[0];
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });
  });

  describe("when reading settings", () => {
    it("should return current behavior", async () => {
      const settings = await readSettings();
      expect(settings.behavior).toEqual("base");
    });

    it("current behavior should exist", async () => {
      const settings = await readSettings();
      const currentBehavior = await readBehavior(settings.behavior);
      expect(currentBehavior.name).toEqual(settings.behavior);
    });
  });

  describe("when updating settings", () => {
    it("should update current behavior", async () => {
      await updateSettings({
        behavior: "user2",
      });
      const settings = await readSettings();
      expect(settings.behavior).toEqual("user2");
    });

    it("should update current delay", async () => {
      await updateSettings({
        delay: 1000,
      });
      const settings = await readSettings();
      expect(settings.delay).toEqual(1000);
    });

    it("should update current behavior", async () => {
      await updateSettings({
        behavior: "base",
      });
      const settings = await readSettings();
      expect(settings.behavior).toEqual("base");
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
          handler: "default",
          response: { body: [{ email: "foo@foo.com" }], status: 200 },
          delay: null,
        },
        {
          id: "get-user:2",
          routeId: "get-user",
          handler: "default",
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
        handler: "default",
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
