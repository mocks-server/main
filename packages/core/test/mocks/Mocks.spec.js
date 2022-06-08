/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");
const { Logger } = require("@mocks-server/logger");

const MockMock = require("./Mock.mock.js");

const Alerts = require("../../src/Alerts");
const Mocks = require("../../src/mocks/Mocks");
const ConfigMock = require("../Config.mocks");
const DefaultRoutesHandler = require("../../src/routes-handlers/default/DefaultRoutesHandler");

describe("Mocks", () => {
  let configMock;
  let sandbox;
  let mockMock;
  let mocks;
  let core;
  let methods;
  let routerMock;
  let alerts;
  let logger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();
    mockMock = new MockMock();
    routerMock = sandbox.stub();
    sandbox.stub(express, "Router").returns(routerMock);
    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "error");
    logger = new Logger();
    alerts = new Alerts("mocks", { logger });

    core = {};
    methods = {
      config: configMock.stubs.namespace,
      getLoadedMocks: sandbox.stub().returns([]),
      getLoadedRoutes: sandbox.stub().returns([]),
      getCurrentMock: sandbox.stub().returns(null),
      onChange: sandbox.stub(),
      alerts,
      logger,
    };

    mocks = new Mocks(methods, core);
    mocks.init([DefaultRoutesHandler]);
  });

  afterEach(() => {
    sandbox.restore();
    mockMock.restore();
  });

  describe("id", () => {
    it("should return mocks", async () => {
      expect(Mocks.id).toEqual("mocks");
    });
  });

  describe("getDelay method", () => {
    it("should return delay option value", () => {
      mocks._currentDelayOption.value = "foo-delay";
      expect(mocks.getDelay()).toEqual("foo-delay");
    });
  });

  describe("load method", () => {
    it("should process loaded mocks", () => {
      mocks.load();
      expect(mocks.plainMocks).toEqual([]);
    });

    it("should process loaded routes", () => {
      mocks.load();
      expect(mocks.plainRoutes).toEqual([]);
    });

    it("should process routesVariants routes", () => {
      mocks.load();
      expect(mocks.plainRoutesVariants).toEqual([]);
    });

    it("should call onChange method", () => {
      mocks.load();
      expect(methods.onChange.callCount).toEqual(1);
    });
  });

  describe("when there are no mocks", () => {
    it("should call to create express router", () => {
      mocks.load();
      expect(express.Router.callCount).toEqual(1);
      mocks.router();
      expect(routerMock.callCount).toEqual(1);
    });

    it("should return null as current", () => {
      mocks.load();
      expect(mocks.current).toEqual(null);
    });

    it("should return empty array in ids", () => {
      mocks.load();
      expect(mocks.ids).toEqual([]);
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
      it("should return mock id", () => {
        mocks.load();
        expect(mocks.current).toEqual("mock-id");
      });

      it("should return array of ids in ids getter", () => {
        mocks.load();
        expect(mocks.ids).toEqual(["mock-id"]);
      });
    });

    describe("when setting current mock", () => {
      it("should set current mock when it exists", () => {
        mocks.load();
        mocks.current = "mock-id";
        expect(mocks.current).toEqual("mock-id");
      });

      it("should set default mock when id does not exists", () => {
        mocks.load();
        mocks.current = "foo-id";
        expect(mocks.current).toEqual("mock-id");
      });
    });

    describe("when setting custom route variant", () => {
      it("should return customVariants", () => {
        mocks.load();
        mocks.useRouteVariant("route-2:variant-2");
        expect(mocks.customRoutesVariants).toEqual(["route-2:variant-2"]);
      });
    });

    describe("when restoring custom route variants", () => {
      it("should return empty array", () => {
        mocks.load();
        mocks.useRouteVariant("route-2:variant-2");
        expect(mocks.customRoutesVariants).toEqual(["route-2:variant-2"]);
        mocks.restoreRoutesVariants();
        expect(mocks.customRoutesVariants).toEqual([]);
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
        mocks.load();
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
        mocks.load();
        mocks.current = "foo-id";
        expect(mocks.current).toEqual(null);
      });
    });
  });
});
