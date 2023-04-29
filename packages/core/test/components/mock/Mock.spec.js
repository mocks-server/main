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

const { Alerts } = require("../../../src/alerts/Alerts");
const Mock = require("../../../src/mock/Mock");
const ConfigMock = require("../common/Config.mocks");

const { VariantHandlerJson } = require("../../../src/variant-handlers/handlers/Json");

describe("Mock", () => {
  let configMock;
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
      getCurrentMock: sandbox.stub().returns(null),
      onChange: sandbox.stub(),
      alerts,
      logger,
    };

    mock = new Mock(methods, core);
    mock._routeLoadersManager.resources = [];
    mock._collectionLoadersManager.resources = [];
    mock.init([VariantHandlerJson]);
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

  describe("getDelay method", () => {
    it("should return delay option value", () => {
      mock._routes._delayOption.hasBeenSet = true;
      mock._routes._delayOption.value = "foo-delay";
      expect(mock._getDelay()).toEqual("foo-delay");
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
      expect(mock.collections.plain).toEqual([]);
    });

    it("should process loaded routes", () => {
      mock.load();
      expect(mock.routes.plain).toEqual([]);
    });

    it("should process route variants", () => {
      mock.load();
      expect(mock.routes.plainVariants).toEqual([]);
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

    it("should return null as selected collection", () => {
      mock.load();
      expect(mock.collections.selected).toEqual(null);
    });

    it("should return empty array in collections ids", () => {
      mock.load();
      expect(mock.collections.ids).toEqual([]);
    });
  });

  describe("routes", () => {
    describe("plain", () => {
      it("should return routes in plain format", () => {
        mock._plainRoutes = ["foo", "foo-2"];
        expect(mock.routes.plain).toEqual(["foo", "foo-2"]);
      });
    });

    describe("plainVariants", () => {
      it("should return variants in plain format", () => {
        mock._plainVariants = ["foo", "foo-2"];
        expect(mock.routes.plainVariants).toEqual(["foo", "foo-2"]);
      });
    });
  });

  describe("collections", () => {
    describe("plain", () => {
      it("should return collections in plain format", () => {
        mock._plainCollections = ["foo", "foo-2"];
        expect(mock.collections.plain).toEqual(["foo", "foo-2"]);
      });
    });
  });

  describe("when there are valid mocks and routes", () => {
    beforeEach(() => {
      mock._routeLoadersManager.resources = [
        {
          id: "route-1",
          variants: [
            { id: "variant-1", method: "GET", type: "json", options: { body: {}, status: 200 } },
          ],
        },
        {
          id: "route-2",
          delay: 500,
          variants: [
            { id: "variant-1", method: "GET", type: "json", options: { body: {}, status: 200 } },
            {
              id: "variant-2",
              delay: 1000,
              method: "GET",
              type: "json",
              options: { body: {}, status: 200 },
            },
          ],
        },
      ];
      mock._collectionLoadersManager.resources = [
        {
          id: "mock-1",
          routes: ["route-1:variant-1", "route-2:variant-1"],
        },
        {
          id: "mock-2",
          from: "mock-1",
          routes: ["route-2:variant-2"],
        },
      ];
    });

    describe("when loaded", () => {
      it("should set current id", () => {
        mock.load();
        expect(mock.collections.selected).toEqual("mock-id");
      });

      it("should set selected collection id using new option if it was set", () => {
        mock._collectionsInstance._selectedOption.hasBeenSet = true;
        mock._collectionsInstance._selectedOption.value = "mock-id";
        mock.load();
        expect(mock.collections.selected).toEqual("mock-id");
      });
    });

    describe("when setting current collection", () => {
      it("should set selected collection when it exists", () => {
        mock.load();
        mock.collections.select("mock-id");
        expect(mock.collections.selected).toEqual("mock-id");
      });

      it("should set default collection when id does not exists", () => {
        mock.load();
        mock.collections.select("foo-id");
        expect(mock.collections.selected).toEqual("mock-id");
      });
    });

    describe("when setting current collection using select method", () => {
      it("should set selected collection option", () => {
        mock.load();
        mock.collections.select("foo-mock-id");
        expect(mock._collectionsInstance._selectedOption.value).toEqual("foo-mock-id");
      });

      it("should return a promise and resolve it when current collection changes to the given value", () => {
        mock.load();
        mock._selectedId = "foo";
        const promise = mock.collections.select("foo-mock-id", { check: true }).then(() => {
          expect(mock.collections.selected).toEqual("foo-mock-id");
        });
        setTimeout(() => {
          mock._selectedId = "foo-mock-id";
        }, 400);
        return promise;
      });

      it("should reject the promise when current collection does not change to the given value", () => {
        mock.load();
        mock._selectedId = "foo";
        return mock.collections.select("foo-mock-id", { check: true }).catch(() => {
          expect(mock.collections.selected).toEqual("foo");
        });
      });
    });

    describe("when setting custom route variant", () => {
      it("should return customVariants", () => {
        mock.load();
        mock.useRouteVariant("route-2:variant-2");
        expect(mock.customRouteVariants).toEqual(["route-2:variant-2"]);
      });
    });

    describe("when restoring custom route variants", () => {
      it("should return empty array", () => {
        mock.load();
        mock.useRouteVariant("route-2:variant-2");
        expect(mock.customRouteVariants).toEqual(["route-2:variant-2"]);
        mock.restoreRouteVariants();
        expect(mock.customRouteVariants).toEqual([]);
      });
    });
  });

  describe("when there are no valid collections", () => {
    beforeEach(() => {
      mock._routeLoadersManager.resources = [];
      mock._collectionLoadersManager.resources = [null];
    });

    describe("when loaded", () => {
      it("should add alerts", () => {
        mock.load();
        expect(alerts.flat).toEqual([
          {
            id: "mocks:routes:load:0:validation",
            message: "Route is invalid: : type must be object",
            error: undefined,
          },
          {
            id: "mocks:collections:selected",
            message: "Option 'mock.collections.selected' was not defined",
            error: undefined,
          },
          {
            id: "mocks:collections:empty",
            message: "No collections found",
            error: undefined,
          },
          {
            id: "mocks:collections:load:critical-error",
            message: "Critical errors found while loading collections: 1",
            error: undefined,
          },
          {
            id: "mocks:collections:load:0:validation",
            message: "Collection is invalid: : type must be object",
            error: undefined,
          },
        ]);
      });
    });

    describe("when setting current collection", () => {
      it("should not set collection when id does not exists", () => {
        mock.load();
        mock.collections.select("foo-id");
        expect(mock.collections.selected).toEqual(null);
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
