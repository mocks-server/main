/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { Logger } = require("@mocks-server/logger");

const CoreMocks = require("../../Core.mocks.js");
const { Routes } = require("../../../../src/mock/routes/Routes");
const { Route } = require("../../../../src/mock/routes/Route");
const { compileRouteValidator } = require("../../../../src/mock/validations");

const { VariantHandlerJson } = require("../../../../src/variant-handlers/handlers/Json");
const { Alerts } = require("../../../../src/alerts/Alerts");
const ConfigMock = require("../../common/Config.mocks");

describe("Routes", () => {
  class FooHandler {
    static get id() {
      return "foo-handler";
    }

    constructor() {
      throw new Error("Error creating variant handler");
    }
  }
  const VALID_ROUTE = {
    id: "foo-route",
    url: "/foo",
    method: "POST",
    variants: [
      {
        id: "foo",
        type: "json",
        options: {
          status: 200,
          body: {},
        },
      },
    ],
  };
  const VALID_VARIANT = {
    id: "foo-variant",
    type: "json",
    options: {
      headers: {
        foo: "foo",
      },
      status: 200,
      body: {},
    },
  };
  let sandbox,
    alerts,
    logger,
    coreMocks,
    routes,
    configMock,
    onChangeDelay,
    getPlainRoutes,
    getPlainVariants;

  beforeAll(() => {
    compileRouteValidator([VariantHandlerJson, { id: "foo-handler" }]);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "error");
    logger = new Logger();
    coreMocks = new CoreMocks();
    alerts = new Alerts("foo", { logger });
    getPlainRoutes = sandbox.stub().returns([]);
    getPlainVariants = sandbox.stub().returns([]);
    configMock = new ConfigMock();
    routes = new Routes(
      {
        alerts,
        logger,
        config: configMock.stubs.namespace,
        onChangeDelay,
        getPlainRoutes,
        getPlainVariants,
      },
      coreMocks
    );
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("loadDefinitions method", () => {
    it("should get route delay from variant delay if defined", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, type: "json", delay: 5000 }],
          },
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();
      expect(routeVariants[0].delay).toEqual(5000);
    });

    it("should get route delay from route delay if variant delay is not defined", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            delay: 4000,
            variants: [{ ...VALID_VARIANT, type: "json" }],
          },
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();
      expect(routeVariants[0].delay).toEqual(4000);
    });

    it("should set delay as null if route delay and variant delay are not defined", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, type: "json" }],
          },
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();
      expect(routeVariants[0].delay).toEqual(null);
    });

    it("should add an alert if route is not valid", () => {
      routes.loadDefinitions(
        [
          {
            id: "foo-route",
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants).toEqual([]);

      expect(alerts.flat[0].id).toEqual("foo:load:foo-route:validation");
      expect(alerts.flat[0].message).toEqual(
        "Route with id 'foo-route' is invalid:  must have required property 'variants'"
      );
    });

    it("alert should use route index if route id is not defined", () => {
      routes.loadDefinitions(
        [
          {
            variants: [{ disabled: true }],
          },
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();

      expect(routeVariants).toEqual([]);
      expect(alerts.flat).toEqual([
        {
          id: "foo:load:0:validation",
          message:
            "Route is invalid:  must have required property 'url'. /variants/0 must have required property 'id'",
        },
      ]);
    });

    it("should add an alert if variant handler options are not valid", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, options: { foo: "bar" } }],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants).toEqual([]);

      expect(alerts.flat[0].id).toEqual("foo:load:foo-route:variants:foo-variant:validation");
      expect(alerts.flat[0].message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property: must have required property 'body'"
      );
    });

    it("should add an alert if variant only has id", () => {
      compileRouteValidator([VariantHandlerJson, FooHandler]);
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ id: "foo-variant" }],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(0);
      expect(alerts.flat).toEqual([
        {
          id: "foo:load:foo-route:variants:foo-variant:validation",
          message:
            "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: 'type' property is required or 'disabled' property should be true",
        },
      ]);
    });

    it("should add an alert if disabled variant is not valid", () => {
      compileRouteValidator([VariantHandlerJson, FooHandler]);
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, disabled: true }],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(0);
      expect(alerts.flat).toEqual([
        {
          id: "foo:load:foo-route:validation",
          message:
            "Route with id 'foo-route' is invalid: /variants/0 Property type is not expected to be here. /variants/0 Property options is not expected to be here. /variants/0: oneOf must match exactly one schema in oneOf. /variants/0/disabled must be equal to one of the allowed values: false",
        },
      ]);
    });

    it("should not add an alert if disabled variant is valid", () => {
      compileRouteValidator([VariantHandlerJson, FooHandler]);
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ id: "foo-variant", disabled: true }],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(1);
      expect(routeVariants[0].disabled).toEqual(true);
    });

    it("should return variant handlers if route and variants are valid", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();
      expect(routeVariants[0]).toBeInstanceOf(Route);
      expect(routeVariants[0].type).toEqual("json");
      expect(routeVariants[0].id).toEqual("foo-route:foo-variant");
      expect(routeVariants[0].variantId).toEqual("foo-variant");
      expect(routeVariants[0].routeId).toEqual("foo-route");
      expect(routeVariants[0].url).toEqual("/foo");
      expect(routeVariants[0].method).toEqual("POST");
    });

    it("should add an alert if variant has only id", () => {
      compileRouteValidator([VariantHandlerJson, FooHandler]);
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ id: "foo-variant" }],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(0);
      expect(alerts.flat).toEqual([
        {
          id: "foo:load:foo-route:variants:foo-variant:validation",
          message:
            "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: 'type' property is required or 'disabled' property should be true",
        },
      ]);
    });

    it("should omit not valid routes and variants", () => {
      routes.loadDefinitions(
        [
          {},
          {
            ...VALID_ROUTE,
            variants: [{}],
          },
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
          {},
        ],
        [VariantHandlerJson]
      );
      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(1);
      expect(routeVariants[0]).toBeInstanceOf(Route);
      expect(routeVariants[0].variantId).toEqual("foo-variant");
      expect(routeVariants[0].id).toEqual("foo-route:foo-variant");
      expect(routeVariants[0].routeId).toEqual("foo-route");
      expect(routeVariants[0].url).toEqual("/foo");
      expect(routeVariants[0].method).toEqual("POST");
    });

    it("should omit duplicated routes", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(1);

      expect(alerts.flat[0].id).toEqual("foo:load:foo-route:duplicated");
      expect(alerts.flat[0].message).toEqual(
        "Route with duplicated id 'foo-route' detected. It has been ignored"
      );
    });

    it("should omit duplicated variants", () => {
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT, VALID_VARIANT],
          },
        ],
        [VariantHandlerJson]
      );

      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(1);

      expect(alerts.flat[0].id).toEqual("foo:load:foo-route:variants:foo-variant:duplicated");
      expect(alerts.flat[0].message).toEqual(
        "Route variant with duplicated id 'foo-variant' detected in route 'foo-route'. It has been ignored"
      );
    });

    it("should omit not valid variants", () => {
      compileRouteValidator([VariantHandlerJson, FooHandler]);
      routes.loadDefinitions(
        [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, type: "foo-handler" }],
          },
        ],
        [FooHandler]
      );
      const routeVariants = routes.get();

      expect(routeVariants.length).toEqual(0);

      expect(alerts.flat[0].id).toEqual("foo:load:foo-route:variants:foo-variant:process");
      expect(alerts.flat[0].message).toEqual("Error creating variant handler");
    });
  });
});
