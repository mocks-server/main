/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");
const { Logger } = require("@mocks-server/logger");

const CollectionMock = require("./Collection.mock");
const LoadersMock = require("./Loaders.mocks");

const Alerts = require("../../src/alerts/Alerts");
const Mock = require("../../src/mock/Mock");
const ConfigMock = require("../common/Config.mocks");
const DefaultRoutesHandler = require("../../src/variant-handlers/handlers/Default");

describe("Mock", () => {
  let configMock;
  let legacyConfigMock;
  let sandbox;
  let collectionMock;
  let mock;
  let core;
  let methods;
  let routerMock;
  let alerts;
  let logger;
  let loadersMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();
    loadersMock = new LoadersMock();
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
      getCurrentMock: sandbox.stub().returns(null),
      onChange: sandbox.stub(),
      alerts,
      logger,
    };

    mock = new Mock(methods, core);
    mock._routesLoaders.contents = [];
    mock._collectionsLoaders.contents = [];
    mock.init([DefaultRoutesHandler]);
  });

  afterEach(() => {
    sandbox.restore();
    collectionMock.restore();
  });

  describe("id", () => {
    it("should return routes", async () => {
      expect(Mock.id).toEqual("mock");
    });
  });

  describe("legacyId", () => {
    it("should return mocks", async () => {
      expect(Mock.legacyId).toEqual("mocks");
    });
  });

  describe("getDelay method", () => {
    it("should return delay option value", () => {
      mock._routes._delayOption.hasBeenSet = true;
      mock._routes._delayOption.value = "foo-delay";
      expect(mock._getDelay()).toEqual("foo-delay");
    });

    it("should set an alert if legacy delay option has been set", () => {
      mock._currentDelayOptionLegacy.hasBeenSet = true;
      mock._currentDelayOptionLegacy.value = "foo-delay";
      mock._getDelay();
      const alert = alerts.flat.pop();
      expect(alert.id).toEqual("mocks.delay");
      expect(alert.value.message).toEqual(
        "Option 'mocks.delay' is deprecated. Use 'mock.routes.delay' instead"
      );
      expect(alert.collection).toEqual("mocks:deprecated");
    });

    it("should return legacy delay option value if new option has not been set", () => {
      mock._routes._delayOption.hasBeenSet = false;
      mock._routes._delayOption.value = "foo-delay";
      mock._currentDelayOptionLegacy.value = "foo-delay-legacy";
      expect(mock._getDelay()).toEqual("foo-delay-legacy");
    });
  });

  describe("onChange method", () => {
    it("should add listener to eventEmitter", () => {
      const spy = sandbox.spy();
      mock.onChange(spy);
      mock._eventEmitter.emit("change:mock");
      expect(spy.callCount).toEqual(1);
    });

    it("should return a function to remove listener", () => {
      expect.assertions(2);
      const spy = sandbox.spy();
      const removeCallback = mock.onChange(spy);
      mock._eventEmitter.emit("change:mock");
      expect(spy.callCount).toEqual(1);
      removeCallback();
      mock._eventEmitter.emit("change:mock");
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("load method", () => {
    it("should process loaded mocks", () => {
      mock.load();
      expect(mock.plainMocks).toEqual([]);
    });

    it("should process loaded routes", () => {
      mock.load();
      expect(mock.plainRoutes).toEqual([]);
    });

    it("should process routesVariants routes", () => {
      mock.load();
      expect(mock.plainRoutesVariants).toEqual([]);
    });

    it("should call onChange method", () => {
      mock.load();
      expect(methods.onChange.callCount).toEqual(1);
    });
  });

  describe("when there are no mocks", () => {
    it("should call to create express router", () => {
      mock.load();
      expect(express.Router.callCount).toEqual(1);
      mock.router();
      expect(routerMock.callCount).toEqual(1);
    });

    it("should return null as current", () => {
      mock.load();
      expect(mock.current).toEqual(null);
    });

    it("should return empty array in ids", () => {
      mock.load();
      expect(mock.ids).toEqual([]);
    });
  });

  describe("when there are valid mocks and routes", () => {
    beforeEach(() => {
      mock._routesLoaders.contents = [
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
      ];
      mock._collectionsLoaders.contents = [
        {
          id: "mock-1",
          routesVariants: ["route-1:variant-1", "route-2:variant-1"],
        },
        {
          id: "mock-2",
          from: "mock-1",
          routesVariants: ["route-2:variant-2"],
        },
      ];
    });

    describe("when loaded", () => {
      it("should set selected collection id", () => {
        mock.load();
        expect(mock.current).toEqual("mock-id");
      });

      it("should return array of ids in ids getter", () => {
        mock.load();
        expect(mock.ids).toEqual(["mock-id"]);
      });

      it("should set selected collection id using new option if it was set", () => {
        mock._collections._selectedOption.hasBeenSet = true;
        mock._collections._selectedOption.value = "mock-id";
        mock.load();
        expect(mock.current).toEqual("mock-id");
      });

      it("should set selected collection id using legacy option if new was not set", () => {
        mock._collections._selectedOption.hasBeenSet = false;
        mock._collections._selectedOption.value = "foo";
        mock._currentMockOptionLegacy.hasBeenSet = true;
        mock._currentMockOptionLegacy.value = "mock-id";
        mock.load();
        expect(mock.current).toEqual("mock-id");
      });
    });

    describe("when legacy option mocks.selected changes", () => {
      it("should set current mock when it exists", () => {
        mock.load();
        mock._setCurrentLegacy("mock-id");
        expect(mock.current).toEqual("mock-id");
      });
    });

    describe("when setting current collection", () => {
      it("should set current collection when it exists", () => {
        mock.load();
        mock.current = "mock-id";
        expect(mock.current).toEqual("mock-id");
      });

      it("should set default collection when id does not exists", () => {
        mock.load();
        mock.current = "foo-id";
        expect(mock.current).toEqual("mock-id");
      });
    });

    describe("when setting custom route variant", () => {
      it("should return customVariants", () => {
        mock.load();
        mock.useRouteVariant("route-2:variant-2");
        expect(mock.customRoutesVariants).toEqual(["route-2:variant-2"]);
      });
    });

    describe("when restoring custom route variants using legacy method", () => {
      it("should return empty array", () => {
        mock.load();
        mock.useRouteVariant("route-2:variant-2");
        expect(mock.customRoutesVariants).toEqual(["route-2:variant-2"]);
        mock.restoreRoutesVariants();
        expect(mock.customRoutesVariants).toEqual([]);
      });
    });

    describe("when restoring custom route variants", () => {
      it("should return empty array", () => {
        mock.load();
        mock.useRouteVariant("route-2:variant-2");
        expect(mock.customRoutesVariants).toEqual(["route-2:variant-2"]);
        mock.restoreRouteVariants();
        expect(mock.customRoutesVariants).toEqual([]);
      });
    });
  });

  describe("when there are no valid collections", () => {
    beforeEach(() => {
      mock._routesLoaders.contents = [];
      mock._collectionsLoaders.contents = [null];
    });

    describe("when loaded", () => {
      it("should add alerts", () => {
        mock.load();
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
            id: "validation",
            value: { message: "Route is invalid: : type must be object", error: undefined },
            collection: "mocks:loadRoutes:0",
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

    describe("when setting current collection", () => {
      it("should not set collection when id does not exists", () => {
        mock.load();
        mock.current = "foo-id";
        expect(mock.current).toEqual(null);
      });
    });
  });

  describe("createLoaders method", () => {
    it("should return new loaders", () => {
      const { loadRoutes, loadCollections } = mock.createLoaders();
      expect(loadRoutes).toBe(loadersMock.stubs.loader);
      expect(loadCollections).toBe(loadersMock.stubs.loader);
    });
  });

  describe("when collections load", () => {
    it("should not load collections if routes are not loaded", () => {
      sandbox.spy(mock, "load");
      expect.assertions(1);
      loadersMock.stubs.Constructor.mock.calls[0][0].onLoad();
      expect(mock.load.callCount).toEqual(0);
    });

    it("should load collections if routes are loaded", () => {
      sandbox.spy(mock, "load");
      expect.assertions(1);
      loadersMock.stubs.Constructor.mock.calls[1][0].onLoad();
      loadersMock.stubs.Constructor.mock.calls[0][0].onLoad();
      expect(mock.load.callCount).toEqual(1);
    });
  });

  describe("when routes load", () => {
    it("should not load routes if collections are not loaded", () => {
      sandbox.spy(mock, "load");
      expect.assertions(1);
      loadersMock.stubs.Constructor.mock.calls[1][0].onLoad();
      expect(mock.load.callCount).toEqual(0);
    });

    it("should load routes if collections are loaded", () => {
      sandbox.spy(mock, "load");
      expect.assertions(1);
      loadersMock.stubs.Constructor.mock.calls[0][0].onLoad();
      loadersMock.stubs.Constructor.mock.calls[1][0].onLoad();
      expect(mock.load.callCount).toEqual(1);
    });
  });
});
