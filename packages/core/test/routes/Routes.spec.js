/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");
const { Logger } = require("@mocks-server/logger");

const CollectionMock = require("./Collection.mock.js");

const Alerts = require("../../src/alerts/Alerts");
const Routes = require("../../src/routes/Routes");
const ConfigMock = require("../common/Config.mocks");
const DefaultRoutesHandler = require("../../src/routes/variant-handlers/handlers/Default");

describe("Routes", () => {
  let configMock;
  let legacyConfigMock;
  let sandbox;
  let collectionMock;
  let routes;
  let core;
  let methods;
  let routerMock;
  let alerts;
  let logger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();
    legacyConfigMock = new ConfigMock();
    collectionMock = new CollectionMock();
    routerMock = sandbox.stub();
    sandbox.stub(express, "Router").returns(routerMock);
    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "error");
    logger = new Logger();
    alerts = new Alerts("mocks", { logger });

    core = {};
    methods = {
      config: configMock.stubs.namespace,
      legacyConfig: legacyConfigMock.stubs.namespace,
      getLoadedMocks: sandbox.stub().returns([]),
      getLoadedRoutes: sandbox.stub().returns([]),
      getCurrentMock: sandbox.stub().returns(null),
      onChange: sandbox.stub(),
      alerts,
      logger,
    };

    routes = new Routes(methods, core);
    routes.init([DefaultRoutesHandler]);
  });

  afterEach(() => {
    sandbox.restore();
    collectionMock.restore();
  });

  describe("id", () => {
    it("should return routes", async () => {
      expect(Routes.id).toEqual("routes");
    });
  });

  describe("legacyId", () => {
    it("should return mocks", async () => {
      expect(Routes.legacyId).toEqual("mocks");
    });
  });

  describe("getDelay method", () => {
    it("should return delay option value", () => {
      routes._currentDelayOption.hasBeenSet = true;
      routes._currentDelayOption.value = "foo-delay";
      expect(routes._getDelay()).toEqual("foo-delay");
    });

    it("should set an alert if legacy delay option has been set", () => {
      routes._currentDelayOptionLegacy.hasBeenSet = true;
      routes._currentDelayOptionLegacy.value = "foo-delay";
      routes._getDelay();
      const alert = alerts.flat.pop();
      expect(alert.id).toEqual("mocks.delay");
      expect(alert.value.message).toEqual(
        "Option mocks.delay is deprecated. Use routes.delay instead"
      );
      expect(alert.collection).toEqual("mocks:deprecated");
    });

    it("should return legacy delay option value if new option has not been set", () => {
      routes._currentDelayOption.hasBeenSet = false;
      routes._currentDelayOption.value = "foo-delay";
      routes._currentDelayOptionLegacy.value = "foo-delay-legacy";
      expect(routes._getDelay()).toEqual("foo-delay-legacy");
    });
  });

  describe("load method", () => {
    it("should process loaded mocks", () => {
      routes.load();
      expect(routes.plainMocks).toEqual([]);
    });

    it("should process loaded routes", () => {
      routes.load();
      expect(routes.plainRoutes).toEqual([]);
    });

    it("should process routesVariants routes", () => {
      routes.load();
      expect(routes.plainRoutesVariants).toEqual([]);
    });

    it("should call onChange method", () => {
      routes.load();
      expect(methods.onChange.callCount).toEqual(1);
    });
  });

  describe("when there are no mocks", () => {
    it("should call to create express router", () => {
      routes.load();
      expect(express.Router.callCount).toEqual(1);
      routes.router();
      expect(routerMock.callCount).toEqual(1);
    });

    it("should return null as current", () => {
      routes.load();
      expect(routes.current).toEqual(null);
    });

    it("should return empty array in ids", () => {
      routes.load();
      expect(routes.ids).toEqual([]);
    });
  });

  describe("when there are valid mocks and routes", () => {
    beforeEach(() => {
      methods.getLoadedMocks.returns([
        {
          id: "mock-1",
          routesVariants: ["route-1:variant-1", "route-2:variant-1"],
        },
        {
          id: "mock-2",
          from: "mock-1",
          routesVariants: ["route-2:variant-2"],
        },
      ]);
      methods.getLoadedRoutes.returns([
        {
          id: "route-1",
          variants: [{ id: "variant-1", method: "GET", response: { body: {}, status: 200 } }],
        },
        {
          id: "route-2",
          delay: 500,
          variants: [
            { id: "variant-1", method: "GET", response: { body: {}, status: 200 } },
            { id: "variant-2", delay: 1000, method: "GET", response: { body: {}, status: 200 } },
          ],
        },
      ]);
    });

    describe("when loaded", () => {
      it("should set selected collection id", () => {
        routes.load();
        expect(routes.current).toEqual("mock-id");
      });

      it("should return array of ids in ids getter", () => {
        routes.load();
        expect(routes.ids).toEqual(["mock-id"]);
      });

      it("should set selected collection id using new option if it was set", () => {
        routes._collections._selectedOption.hasBeenSet = true;
        routes._collections._selectedOption.value = "mock-id";
        routes.load();
        expect(routes.current).toEqual("mock-id");
      });

      it("should set selected collection id using legacy option if new was not set", () => {
        routes._collections._selectedOption.hasBeenSet = false;
        routes._collections._selectedOption.value = "foo";
        routes._currentMockOptionLegacy.hasBeenSet = true;
        routes._currentMockOptionLegacy.value = "mock-id";
        routes.load();
        expect(routes.current).toEqual("mock-id");
      });
    });

    describe("when legacy option mock.selected changes", () => {
      it("should set current mock when it exists", () => {
        routes.load();
        routes._setCurrentLegacy("mock-id");
        expect(routes.current).toEqual("mock-id");
      });
    });

    describe("when setting current mock", () => {
      it("should set current mock when it exists", () => {
        routes.load();
        routes.current = "mock-id";
        expect(routes.current).toEqual("mock-id");
      });

      it("should set default mock when id does not exists", () => {
        routes.load();
        routes.current = "foo-id";
        expect(routes.current).toEqual("mock-id");
      });
    });

    describe("when setting custom route variant", () => {
      it("should return customVariants", () => {
        routes.load();
        routes.useRouteVariant("route-2:variant-2");
        expect(routes.customRoutesVariants).toEqual(["route-2:variant-2"]);
      });
    });

    describe("when restoring custom route variants", () => {
      it("should return empty array", () => {
        routes.load();
        routes.useRouteVariant("route-2:variant-2");
        expect(routes.customRoutesVariants).toEqual(["route-2:variant-2"]);
        routes.restoreRoutesVariants();
        expect(routes.customRoutesVariants).toEqual([]);
      });
    });
  });

  describe("when there are no valid mocks", () => {
    beforeEach(() => {
      methods.getLoadedMocks.returns([null]);
      methods.getLoadedRoutes.returns([]);
    });

    describe("when loaded", () => {
      it("should add alerts", () => {
        routes.load();
        expect(alerts.flat).toEqual([
          {
            id: "settings",
            value: { message: "Option 'mock' was not defined", error: undefined },
            collection: "mocks",
          },
          {
            id: "empty",
            value: { message: "No mocks found", error: undefined },
            collection: "mocks",
          },
          {
            id: "critical-error",
            value: {
              message: "Critical errors found while loading mocks: 1",
              error: undefined,
            },
            collection: "mocks:loadMocks",
          },
          {
            id: "validation",
            value: {
              message: "Mock is invalid: : type must be object",
              error: undefined,
            },
            collection: "mocks:loadMocks:0",
          },
        ]);
      });
    });

    describe("when setting current mock", () => {
      it("should not set mock when id does not exists", () => {
        routes.load();
        routes.current = "foo-id";
        expect(routes.current).toEqual(null);
      });
    });
  });
});
