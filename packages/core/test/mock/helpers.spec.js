/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const express = require("express");
const { Logger } = require("@mocks-server/logger");

const CoreMocks = require("../Core.mocks.js");
const {
  getVariantId,
  getCollectionRouteVariants,
  getPlainCollections,
  getPlainRoutes,
  getPlainRouteVariants,
  addCustomVariant,
  hasDelayProperty,
  getRouteHandlerDelay,
  getVariantHandler,
  getRouteVariants,
  getCollection,
  plainCollectionsToLegacy,
  plainRouteVariantsToLegacy,
} = require("../../src/mock/helpers");
const { compileRouteValidator } = require("../../src/mock/validations");
const DefaultRoutesHandler = require("../../src/variant-handlers/handlers/Default");
const JsonRoutesHandler = require("../../src/variant-handlers/handlers/Json");
const Alerts = require("../../src/alerts/Alerts");

describe("mocks helpers", () => {
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
        handler: "foo-handler",
      },
    ],
  };
  const VALID_VARIANT = {
    id: "foo-variant",
    response: {
      headers: {
        foo: "foo",
      },
      status: 200,
      body: {},
    },
  };
  let sandbox, alerts, logger, loggerRoutes, alertsRoutes, coreMocks;

  beforeAll(() => {
    compileRouteValidator([{ id: "foo-handler" }]);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "error");
    logger = new Logger();
    coreMocks = new CoreMocks();
    alerts = new Alerts("foo", { logger });
    loggerRoutes = new Logger();
    alertsRoutes = new Alerts("routes", { logger });
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("getVariantId", () => {
    it("should return route id and variant id concated with :", () => {
      expect(getVariantId("foo-route", "foo-id")).toEqual("foo-route:foo-id");
    });
  });

  describe("getMockRoutesVariants", () => {
    const MOCKS = [
      {
        id: "mock-1",
        routesVariants: ["route-1:success", "route-2:success", "route-3:success"],
      },
      {
        id: "mock-2",
        from: "mock-1",
        routesVariants: ["route-3:error"],
      },
      {
        id: "mock-3",
        from: "mock-2",
        routesVariants: ["route-2:error"],
      },
      {
        id: "mock-4",
        from: "mock-1",
        routesVariants: ["route-1:error"],
      },
    ];
    const ROUTES_VARIANTS = [
      {
        variantId: "route-1:success",
        routeId: "route-1",
      },
      {
        variantId: "route-2:success",
        routeId: "route-2",
      },
      {
        variantId: "route-3:success",
        routeId: "route-3",
      },
      {
        variantId: "route-1:error",
        routeId: "route-1",
      },
      {
        variantId: "route-2:error",
        routeId: "route-2",
      },
      {
        variantId: "route-3:error",
        routeId: "route-3",
      },
    ];

    it("should return route variants of given mock", () => {
      expect(getCollectionRouteVariants(MOCKS[0], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          variantId: "route-1:success",
          routeId: "route-1",
        },
        {
          variantId: "route-2:success",
          routeId: "route-2",
        },
        {
          variantId: "route-3:success",
          routeId: "route-3",
        },
      ]);
    });

    it("should return route variants of given mock when it extends from another", () => {
      expect(getCollectionRouteVariants(MOCKS[1], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          variantId: "route-1:success",
          routeId: "route-1",
        },
        {
          variantId: "route-2:success",
          routeId: "route-2",
        },
        {
          variantId: "route-3:error",
          routeId: "route-3",
        },
      ]);
    });

    it("should return route variants of given mock when it extends recursively", () => {
      expect(getCollectionRouteVariants(MOCKS[2], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          variantId: "route-1:success",
          routeId: "route-1",
        },
        {
          variantId: "route-2:error",
          routeId: "route-2",
        },
        {
          variantId: "route-3:error",
          routeId: "route-3",
        },
      ]);
    });

    it("should respect the order of routes defined in the base mocks when extending", () => {
      expect(getCollectionRouteVariants(MOCKS[3], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          variantId: "route-1:error",
          routeId: "route-1",
        },
        {
          variantId: "route-2:success",
          routeId: "route-2",
        },
        {
          variantId: "route-3:success",
          routeId: "route-3",
        },
      ]);
    });
  });

  describe("legacy getPlainCollections", () => {
    it("should return mocks ids and routeVariants ids", () => {
      expect(
        plainCollectionsToLegacy(
          getPlainCollections(
            [
              {
                id: "mock-id-1",
                routeVariants: [
                  {
                    variantId: "variant-id-1",
                  },
                  {
                    variantId: "variant-id-2",
                  },
                  {
                    variantId: "variant-id-3",
                  },
                ],
              },
              {
                id: "mock-id-2",
                routeVariants: [
                  {
                    variantId: "variant-id-3",
                  },
                ],
              },
            ],
            [
              {
                id: "mock-id-1",
                routes: ["variant-id-1"],
              },
              {
                id: "mock-id-2",
                from: "mock-id-1",
                routes: ["variant-id-3"],
              },
            ]
          )
        )
      ).toEqual([
        {
          id: "mock-id-1",
          from: null,
          routesVariants: ["variant-id-1"],
          appliedRoutesVariants: ["variant-id-1", "variant-id-2", "variant-id-3"],
        },
        {
          id: "mock-id-2",
          from: "mock-id-1",
          routesVariants: ["variant-id-3"],
          appliedRoutesVariants: ["variant-id-3"],
        },
      ]);
    });
  });

  describe("getPlainCollections", () => {
    it("should return mocks ids and routeVariants ids", () => {
      expect(
        getPlainCollections(
          [
            {
              id: "mock-id-1",
              routeVariants: [
                {
                  variantId: "variant-id-1",
                },
                {
                  variantId: "variant-id-2",
                },
                {
                  variantId: "variant-id-3",
                },
              ],
            },
            {
              id: "mock-id-2",
              routeVariants: [
                {
                  variantId: "variant-id-3",
                },
              ],
            },
          ],
          [
            {
              id: "mock-id-1",
              routes: ["variant-id-1"],
            },
            {
              id: "mock-id-2",
              from: "mock-id-1",
              routes: ["variant-id-3"],
            },
          ]
        )
      ).toEqual([
        {
          id: "mock-id-1",
          from: null,
          definedRoutes: ["variant-id-1"],
          routes: ["variant-id-1", "variant-id-2", "variant-id-3"],
        },
        {
          id: "mock-id-2",
          from: "mock-id-1",
          definedRoutes: ["variant-id-3"],
          routes: ["variant-id-3"],
        },
      ]);
    });
  });

  describe("getPlainRoutes", () => {
    const ROUTES_VARIANTS = [
      { variantId: "route-id-1:variant-1", routeId: "route-id-1" },
      { variantId: "route-id-1:variant-2", routeId: "route-id-1" },
      { variantId: "route-id-2:variant-1", routeId: "route-id-2" },
      { variantId: "route-id-5:variant-1", routeId: "route-id-5" },
    ];

    it("should return routes in plain format", () => {
      expect(
        getPlainRoutes(
          [
            {
              id: "route-id-1",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }],
            },
            {
              id: "route-id-2",
              url: "route-url-2",
              method: "route-method-2",
              foo: "route-foo-2",
              variants: [{ id: "variant-1" }],
            },
            {
              id: "route-id-5",
              url: "route-url-5",
              method: "route-method-5",
              foo: "route-foo-5",
              delay: 0,
              variants: [{ id: "variant-1" }],
            },
          ],
          ROUTES_VARIANTS
        )
      ).toEqual([
        {
          id: "route-id-1",
          url: "route-url-1",
          method: "route-method-1",
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
        {
          id: "route-id-2",
          url: "route-url-2",
          method: "route-method-2",
          delay: null,
          variants: ["route-id-2:variant-1"],
        },
        {
          id: "route-id-5",
          url: "route-url-5",
          method: "route-method-5",
          delay: 0,
          variants: ["route-id-5:variant-1"],
        },
      ]);
    });

    it("should omit not valid routes", () => {
      expect(
        getPlainRoutes(
          [
            {
              id: "route-id-3",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }],
            },
            null,
            {
              id: "route-id-2",
              url: "route-url-2",
              method: "route-method-2",
              delay: "route-delay-2",
              foo: "route-foo-2",
              variants: [{ id: "variant-1" }],
            },
            {},
          ],
          ROUTES_VARIANTS
        )
      ).toEqual([
        {
          id: "route-id-2",
          url: "route-url-2",
          method: "route-method-2",
          delay: "route-delay-2",
          variants: ["route-id-2:variant-1"],
        },
      ]);
    });

    it("should omit not valid route variants", () => {
      expect(
        getPlainRoutes(
          [
            {
              id: "route-id-1",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }, { id: "variant-3" }, null],
            },
            {
              id: "route-id-5",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: "foo",
            },
            null,
            "foo",
            {
              id: "route-id-2",
              url: "route-url-2",
              method: "route-method-2",
              delay: "route-delay-2",
              foo: "route-foo-2",
              variants: [{ id: "variant-1" }, { id: "variant-2" }],
            },
            {
              id: "route-id-3",
              url: "route-url-2",
              method: "route-method-2",
              delay: "route-delay-2",
              foo: "route-foo-2",
              variants: "foo",
            },
          ],
          ROUTES_VARIANTS
        )
      ).toEqual([
        {
          id: "route-id-1",
          url: "route-url-1",
          method: "route-method-1",
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
        {
          id: "route-id-5",
          url: "route-url-1",
          method: "route-method-1",
          delay: "route-delay-1",
          variants: [],
        },
        {
          id: "route-id-2",
          url: "route-url-2",
          method: "route-method-2",
          delay: "route-delay-2",
          variants: ["route-id-2:variant-1"],
        },
      ]);
    });

    it("should omit duplicated route variants", () => {
      expect(
        getPlainRoutes(
          [
            {
              id: "route-id-1",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }, { id: "variant-3" }, null],
            },
            {
              id: "route-id-1",
              url: "route-url-1",
              method: "route-method-1",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }, { id: "variant-3" }, null],
            },
          ],
          ROUTES_VARIANTS
        )
      ).toEqual([
        {
          id: "route-id-1",
          url: "route-url-1",
          method: "route-method-1",
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
      ]);
    });
  });

  describe("legacy getPlainRoutesVariants", () => {
    it("should return routes variants in plain format when using legacy plainResponsePreview property", () => {
      expect(
        plainRouteVariantsToLegacy(
          getPlainRouteVariants([
            {
              variantId: "route-1:variant-1",
              routeId: "route-1",
              constructor: { id: "handler-id-1" },
              plainResponsePreview: "response-preview-1",
              delay: "delay-1",
              foo: "foo-1",
            },
            {
              variantId: "route-2:variant-1",
              routeId: "route-2",
              constructor: { id: "handler-id-2" },
              plainResponsePreview: "response-preview-2",
              delay: "delay-2",
              foo: "foo-2",
            },
          ])
        )
      ).toEqual([
        {
          id: "route-1:variant-1",
          routeId: "route-1",
          handler: "handler-id-1",
          response: "response-preview-1",
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          routeId: "route-2",
          handler: "handler-id-2",
          response: "response-preview-2",
          delay: "delay-2",
        },
      ]);
    });

    it("should return routes variants in plain format when constructor is v4", () => {
      expect(
        plainRouteVariantsToLegacy(
          getPlainRouteVariants([
            {
              variantId: "route-1:variant-1",
              routeId: "route-1",
              constructor: { id: "handler-id-1", version: "4" },
              preview: "response-preview-1",
              delay: "delay-1",
              foo: "foo-1",
            },
            {
              variantId: "route-2:variant-1",
              routeId: "route-2",
              constructor: { id: "handler-id-2", version: "4" },
              preview: "response-preview-2",
              delay: "delay-2",
              foo: "foo-2",
            },
          ])
        )
      ).toEqual([
        {
          id: "route-1:variant-1",
          routeId: "route-1",
          handler: "handler-id-1",
          response: "response-preview-1",
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          routeId: "route-2",
          handler: "handler-id-2",
          response: "response-preview-2",
          delay: "delay-2",
        },
      ]);
    });

    it("should return null in response when no preview is defined", () => {
      expect(
        plainRouteVariantsToLegacy(
          getPlainRouteVariants([
            {
              variantId: "route-1:variant-1",
              routeId: "route-1",
              constructor: { id: "handler-id-1", version: "4" },
              delay: "delay-1",
              foo: "foo-1",
            },
            {
              variantId: "route-2:variant-1",
              routeId: "route-2",
              constructor: { id: "handler-id-2", version: "4" },
              delay: "delay-2",
              foo: "foo-2",
            },
          ])
        )
      ).toEqual([
        {
          id: "route-1:variant-1",
          routeId: "route-1",
          handler: "handler-id-1",
          response: null,
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          routeId: "route-2",
          handler: "handler-id-2",
          response: null,
          delay: "delay-2",
        },
      ]);
    });
  });

  describe("getPlainRoutesVariants", () => {
    it("should return routes variants in plain format when using legacy plainResponsePreview property", () => {
      expect(
        getPlainRouteVariants([
          {
            variantId: "route-1:variant-1",
            routeId: "route-1",
            constructor: { id: "handler-id-1" },
            plainResponsePreview: "response-preview-1",
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            variantId: "route-2:variant-1",
            routeId: "route-2",
            constructor: { id: "handler-id-2" },
            plainResponsePreview: "response-preview-2",
            delay: "delay-2",
            foo: "foo-2",
          },
        ])
      ).toEqual([
        {
          id: "route-1:variant-1",
          route: "route-1",
          type: "handler-id-1",
          preview: "response-preview-1",
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          route: "route-2",
          type: "handler-id-2",
          preview: "response-preview-2",
          delay: "delay-2",
        },
      ]);
    });

    it("should return routes variants in plain format when constructor is v4", () => {
      expect(
        getPlainRouteVariants([
          {
            variantId: "route-1:variant-1",
            routeId: "route-1",
            constructor: { id: "handler-id-1", version: "4" },
            preview: "response-preview-1",
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            variantId: "route-2:variant-1",
            routeId: "route-2",
            constructor: { id: "handler-id-2", version: "4" },
            preview: "response-preview-2",
            delay: "delay-2",
            foo: "foo-2",
          },
        ])
      ).toEqual([
        {
          id: "route-1:variant-1",
          route: "route-1",
          type: "handler-id-1",
          preview: "response-preview-1",
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          route: "route-2",
          type: "handler-id-2",
          preview: "response-preview-2",
          delay: "delay-2",
        },
      ]);
    });

    it("should return null in response when no preview is defined", () => {
      expect(
        getPlainRouteVariants([
          {
            variantId: "route-1:variant-1",
            routeId: "route-1",
            constructor: { id: "handler-id-1", version: "4" },
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            variantId: "route-2:variant-1",
            routeId: "route-2",
            constructor: { id: "handler-id-2", version: "4" },
            delay: "delay-2",
            foo: "foo-2",
          },
        ])
      ).toEqual([
        {
          id: "route-1:variant-1",
          route: "route-1",
          type: "handler-id-1",
          preview: null,
          delay: "delay-1",
        },
        {
          id: "route-2:variant-1",
          route: "route-2",
          type: "handler-id-2",
          preview: null,
          delay: "delay-2",
        },
      ]);
    });
  });

  describe("addCustomVariant", () => {
    const VARIANTS = ["route-1:variant-1", "route-2:variant-1", "route-3:variant-1"];

    it("should add variant to the end of variants when route does not exist", () => {
      expect(addCustomVariant("route-4:variant-1", VARIANTS)).toEqual([
        "route-1:variant-1",
        "route-2:variant-1",
        "route-3:variant-1",
        "route-4:variant-1",
      ]);
    });

    it("should not modify original variants array", () => {
      addCustomVariant("route-4:variant-1", VARIANTS);
      expect(VARIANTS).toEqual(["route-1:variant-1", "route-2:variant-1", "route-3:variant-1"]);
    });

    it("should replace variants of the same route in the same position", () => {
      expect(addCustomVariant("route-2:variant-2", VARIANTS)).toEqual([
        "route-1:variant-1",
        "route-2:variant-2",
        "route-3:variant-1",
      ]);
    });
  });

  describe("hasDelayProperty", () => {
    it('should return true if object has property "delay"', () => {
      expect(hasDelayProperty({ delay: 500 })).toEqual(true);
    });

    it('should return true if object has property "delay" with false value', () => {
      expect(hasDelayProperty({ delay: false })).toEqual(true);
    });

    it('should return true if object has property "delay" with null value', () => {
      expect(hasDelayProperty({ delay: null })).toEqual(true);
    });

    it('should return false if object has not property "delay"', () => {
      expect(hasDelayProperty({ foo: "foo" })).toEqual(false);
    });
  });

  describe("getRouteHandlerDelay", () => {
    it("should return variant delay if present", () => {
      expect(getRouteHandlerDelay({ delay: 500 }, { delay: 1000 })).toEqual(500);
    });

    it("should return route delay if variant delay is not defined", () => {
      expect(getRouteHandlerDelay({ foo: 500 }, { delay: 1000 })).toEqual(1000);
    });

    it("should return null if there is no delay in variant nor route", () => {
      expect(getRouteHandlerDelay({ foo: 500 }, { foo: 1000 })).toEqual(null);
    });
  });

  describe("getVariantHandler", () => {
    it("should add an alert if variant is not valid", () => {
      const variantHandler = getVariantHandler({
        route: {},
        variant: {},
        variantIndex: 0,
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat).toEqual([
        {
          collection: "foo:0",
          id: "validation",
          value: {
            message:
              "Variant in route with id 'undefined' is invalid:  must have required property 'response'",
          },
        },
      ]);
    });

    it("alert should include variant id if it is defined", () => {
      const variantHandler = getVariantHandler({
        route: { id: "foo-route" },
        variant: { id: "foo-variant" },
        variantIndex: 0,
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat).toEqual([
        {
          collection: "foo:foo-variant",
          id: "validation",
          value: {
            message:
              "Variant with id 'foo-variant' in route with id 'foo-route' is invalid:  must have required property 'response'",
          },
        },
      ]);
    });

    it("should return a Handler instance if variant is valid", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, delay: 3000 },
        variant: VALID_VARIANT,
        variantIndex: 0,
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toBeInstanceOf(DefaultRoutesHandler);
      expect(variantHandler.delay).toEqual(3000);
      expect(variantHandler.id).toEqual("foo-variant");
      expect(variantHandler.variantId).toEqual("foo-route:foo-variant");
      expect(variantHandler.routeId).toEqual("foo-route");
      expect(variantHandler.url).toEqual("/foo");
      expect(variantHandler.method).toEqual("POST");
    });

    it("should add an Alert and return null is there is an error instantiating Handler", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, delay: 3000 },
        variant: {
          ...VALID_VARIANT,
          handler: "foo-handler",
        },
        variantIndex: 0,
        routeHandlers: [FooHandler, DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat[0].id).toEqual("process");
      expect(alerts.flat[0].value.message).toEqual("Error creating variant handler");
    });

    it("should return variant delay if defined", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, delay: 3000 },
        variant: { ...VALID_VARIANT, delay: 5000 },
        variantIndex: 0,
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });
      expect(variantHandler.delay).toEqual(5000);
    });
  });

  describe("getVariantHandler for v4 variant handlers", () => {
    it("should add an alert if variant is not valid", () => {
      const variantHandler = getVariantHandler({
        route: {},
        variant: {
          handler: "json",
          response: "foo",
        },
        variantIndex: 0,
        routeHandlers: [JsonRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat).toEqual([
        {
          collection: "foo:0",
          id: "validation",
          value: {
            message:
              "Variant in route with id 'undefined' is invalid: Invalid 'options' property:: type must be object",
          },
        },
      ]);
    });

    it("alert should include variant id if it is defined", () => {
      const variantHandler = getVariantHandler({
        route: { id: "foo-route" },
        variant: { handler: "json", id: "foo-variant" },
        variantIndex: 0,
        routeHandlers: [JsonRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat).toEqual([
        {
          collection: "foo:foo-variant",
          id: "validation",
          value: {
            message:
              "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property:: type must be object",
          },
        },
      ]);
    });

    it("should return a Handler instance if variant is valid", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, delay: 3000 },
        variant: { ...VALID_VARIANT, handler: "json" },
        variantIndex: 0,
        routeHandlers: [JsonRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toBeInstanceOf(JsonRoutesHandler);
      expect(variantHandler.delay).toEqual(3000);
      expect(variantHandler.id).toEqual("foo-variant");
      expect(variantHandler.variantId).toEqual("foo-route:foo-variant");
      expect(variantHandler.routeId).toEqual("foo-route");
      expect(variantHandler.url).toEqual("/foo");
      expect(variantHandler.method).toEqual("POST");
    });

    it("should add an Alert and return null is there is an error instantiating Handler", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, handler: "json", delay: 3000 },
        variant: {
          ...VALID_VARIANT,
          handler: "foo-handler",
        },
        variantIndex: 0,
        routeHandlers: [FooHandler, JsonRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(variantHandler).toEqual(null);
      expect(alerts.flat[0].id).toEqual("process");
      expect(alerts.flat[0].value.message).toEqual("Error creating variant handler");
    });

    it("should return variant delay if defined", () => {
      const variantHandler = getVariantHandler({
        route: { ...VALID_ROUTE, delay: 3000 },
        variant: { ...VALID_VARIANT, handler: "json", delay: 5000 },
        variantIndex: 0,
        routeHandlers: [JsonRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });
      expect(variantHandler.delay).toEqual(5000);
    });
  });

  describe("getRouteVariants", () => {
    it("should add an alert if route is not valid", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            id: "foo-route",
          },
        ],
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants).toEqual([]);

      expect(alerts.flat[0].id).toEqual("validation");
      expect(alerts.flat[0].value.message).toEqual(
        "Route with id 'foo-route' is invalid:  must have required property 'variants'"
      );
    });

    it("should add an alert if variant is not valid", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            ...VALID_ROUTE,
            variants: [{}],
          },
        ],
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants).toEqual([]);

      expect(alerts.flat[0].id).toEqual("validation");
      expect(alerts.flat[0].value.message).toEqual(
        "Route with id 'foo-route' is invalid: /variants/0 must have required property 'id'"
      );
    });

    it("should return variant handlers if route and variants are valid", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
        ],
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants[0]).toBeInstanceOf(DefaultRoutesHandler);
      expect(routeVariants[0].id).toEqual("foo-variant");
      expect(routeVariants[0].variantId).toEqual("foo-route:foo-variant");
      expect(routeVariants[0].routeId).toEqual("foo-route");
      expect(routeVariants[0].url).toEqual("/foo");
      expect(routeVariants[0].method).toEqual("POST");
    });

    it("should omit not valid routes and variants", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
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
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants.length).toEqual(1);
      expect(routeVariants[0]).toBeInstanceOf(DefaultRoutesHandler);
      expect(routeVariants[0].id).toEqual("foo-variant");
      expect(routeVariants[0].variantId).toEqual("foo-route:foo-variant");
      expect(routeVariants[0].routeId).toEqual("foo-route");
      expect(routeVariants[0].url).toEqual("/foo");
      expect(routeVariants[0].method).toEqual("POST");
    });

    it("should omit duplicated routes", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT],
          },
        ],
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants.length).toEqual(1);

      expect(alerts.flat[0].id).toEqual("duplicated");
      expect(alerts.flat[0].value.message).toEqual(
        "Route with duplicated id 'foo-route' detected. It has been ignored"
      );
    });

    it("should omit duplicated variants", () => {
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            ...VALID_ROUTE,
            variants: [VALID_VARIANT, VALID_VARIANT],
          },
        ],
        routeHandlers: [DefaultRoutesHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants.length).toEqual(1);

      expect(alerts.flat[0].id).toEqual("duplicated");
      expect(alerts.flat[0].value.message).toEqual(
        "Route variant with duplicated id 'foo-variant' detected in route 'foo-route'. It has been ignored"
      );
    });

    it("should omit not valid variants", () => {
      compileRouteValidator([DefaultRoutesHandler, FooHandler]);
      const routeVariants = getRouteVariants({
        routesDefinitions: [
          {
            ...VALID_ROUTE,
            variants: [{ ...VALID_VARIANT, handler: "foo-handler" }],
          },
        ],
        routeHandlers: [FooHandler],
        core: coreMocks.stubs.instance,
        alerts,
        logger,
        alertsRoutes,
        loggerRoutes,
      });

      expect(routeVariants.length).toEqual(0);

      expect(alerts.flat[0].id).toEqual("process");
      expect(alerts.flat[0].value.message).toEqual("Error creating variant handler");
    });
  });

  describe("getCollection", () => {
    it("should add an alert if mock contains not valid routeVariants", () => {
      const mock = getCollection({
        collectionDefinition: {
          id: "foo-id",
          routesVariants: ["foo-route:foo-id"],
        },
        collectionsDefinitions: [],
        routeVariants: [],
        getGlobalDelay: () => {
          //do nothing
        },
        alerts,
        logger,
      });
      expect(mock.id).toEqual("foo-id");

      expect(alerts.flat[0].id).toEqual("variants");
      expect(alerts.flat[0].value.message).toEqual(
        "Collection with id 'foo-id' is invalid: routeVariant with id 'foo-route:foo-id' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should add an alert if instantiating Mock throws an error", () => {
      sandbox.stub(express, "Router").throws(new Error("Error creating collection"));
      const mock = getCollection({
        collectionDefinition: {
          id: "foo-id",
          routesVariants: ["foo-route:foo-id"],
        },
        collectionsDefinitions: [],
        routeVariants: [
          {
            id: "foo-route",
            variantId: "foo-route:foo-id",
          },
        ],
        getGlobalDelay: () => {
          //do nothing
        },
        alerts,
        logger,
      });
      expect(mock).toEqual(null);

      expect(alerts.flat[0].id).toEqual("process");
      expect(alerts.flat[0].value.message).toEqual("Error processing collection");
    });
  });
});
