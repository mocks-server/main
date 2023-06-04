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
  getCollection,
} = require("../../../src/mock/helpers");
const { compileRouteValidator } = require("../../../src/mock/validations");

const { VariantHandlerJson } = require("../../../src/variant-handlers/handlers/Json");
const { Alerts } = require("../../../src/alerts/Alerts");

describe("mocks helpers", () => {
  let sandbox, alerts, logger, coreMocks;

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
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("getVariantId", () => {
    it("should return route id and variant id joined with :", () => {
      expect(getVariantId("foo-route", "foo-id")).toEqual("foo-route:foo-id");
    });

    it("should return null if no variant id is provided", () => {
      expect(getVariantId("foo-route")).toEqual(null);
    });
  });

  describe("getMockRoutesVariants", () => {
    const MOCKS = [
      {
        id: "mock-1",
        routes: ["route-1:success", "route-2:success", "route-3:success"],
      },
      {
        id: "mock-2",
        from: "mock-1",
        routes: ["route-3:error"],
      },
      {
        id: "mock-3",
        from: "mock-2",
        routes: ["route-2:error"],
      },
      {
        id: "mock-4",
        from: "mock-1",
        routes: ["route-1:error"],
      },
    ];
    const ROUTES_VARIANTS = [
      {
        id: "route-1:success",
        routeId: "route-1",
      },
      {
        id: "route-2:success",
        routeId: "route-2",
      },
      {
        id: "route-3:success",
        routeId: "route-3",
      },
      {
        id: "route-1:error",
        routeId: "route-1",
      },
      {
        id: "route-2:error",
        routeId: "route-2",
      },
      {
        id: "route-3:error",
        routeId: "route-3",
      },
    ];

    it("should return route variants of given mock", () => {
      expect(getCollectionRouteVariants(MOCKS[0], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          id: "route-1:success",
          routeId: "route-1",
        },
        {
          id: "route-2:success",
          routeId: "route-2",
        },
        {
          id: "route-3:success",
          routeId: "route-3",
        },
      ]);
    });

    it("should return route variants of given mock when it extends from another", () => {
      expect(getCollectionRouteVariants(MOCKS[1], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          id: "route-1:success",
          routeId: "route-1",
        },
        {
          id: "route-2:success",
          routeId: "route-2",
        },
        {
          id: "route-3:error",
          routeId: "route-3",
        },
      ]);
    });

    it("should return route variants of given mock when it extends recursively", () => {
      expect(getCollectionRouteVariants(MOCKS[2], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          id: "route-1:success",
          routeId: "route-1",
        },
        {
          id: "route-2:error",
          routeId: "route-2",
        },
        {
          id: "route-3:error",
          routeId: "route-3",
        },
      ]);
    });

    it("should respect the order of routes defined in the base mocks when extending", () => {
      expect(getCollectionRouteVariants(MOCKS[3], MOCKS, ROUTES_VARIANTS)).toEqual([
        {
          id: "route-1:error",
          routeId: "route-1",
        },
        {
          id: "route-2:success",
          routeId: "route-2",
        },
        {
          id: "route-3:success",
          routeId: "route-3",
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
                  id: "variant-id-1",
                },
                {
                  id: "variant-id-2",
                },
                {
                  id: "variant-id-3",
                },
              ],
            },
            {
              id: "mock-id-2",
              routeVariants: [
                {
                  id: "variant-id-3",
                },
              ],
            },
          ],
          [
            {
              id: "mock-id-1",
              routeVariants: ["variant-id-1"],
            },
            {
              id: "mock-id-2",
              from: "mock-id-1",
              routeVariants: ["variant-id-3"],
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
      { id: "route-id-1:variant-1", routeId: "route-id-1" },
      { id: "route-id-1:variant-2", routeId: "route-id-1" },
      { id: "route-id-2:variant-1", routeId: "route-id-2" },
      { id: "route-id-5:variant-1", routeId: "route-id-5" },
      { id: "route-id-6:variant-1", routeId: "route-id-6" },
    ];

    it("should return routes in plain format", () => {
      expect(
        getPlainRoutes(
          [
            {
              id: "route-id-1",
              url: "route-url-1",
              method: "*",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }],
            },
            {
              id: "route-id-2",
              url: "route-url-2",
              method: ["get", "POST", "put"],
              foo: "route-foo-2",
              variants: [{ id: "variant-1" }],
            },
            {
              id: "route-id-5",
              url: "route-url-5",
              method: "PATCH",
              foo: "route-foo-5",
              delay: 0,
              variants: [{ id: "variant-1" }],
            },
            {
              id: "route-id-5",
              url: "route-url-5",
              method: "PATCH",
              foo: "route-foo-5",
              delay: 0,
              variants: [{ id: "variant-1" }],
            },
            {
              id: "route-id-6",
              url: "route-url-6",
              foo: "route-foo-6",
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
          method: ["get", "post", "patch", "delete", "put", "options", "head", "trace"],
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
        {
          id: "route-id-2",
          url: "route-url-2",
          method: ["get", "post", "put"],
          delay: null,
          variants: ["route-id-2:variant-1"],
        },
        {
          id: "route-id-5",
          url: "route-url-5",
          method: "patch",
          delay: 0,
          variants: ["route-id-5:variant-1"],
        },
        {
          id: "route-id-6",
          url: "route-url-6",
          method: ["get", "post", "patch", "delete", "put", "options", "head", "trace"],
          delay: 0,
          variants: ["route-id-6:variant-1"],
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
              method: "GET",
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
          method: "get",
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
              method: "PATCH",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: [{ id: "variant-1" }, { id: "variant-2" }, { id: "variant-3" }, null],
            },
            {
              id: "route-id-5",
              url: "route-url-1",
              method: "FOO",
              delay: "route-delay-1",
              foo: "route-foo-1",
              variants: "foo",
            },
            null,
            "foo",
            {
              id: "route-id-2",
              url: "route-url-2",
              method: ["get"],
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
          method: "patch",
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
        {
          id: "route-id-5",
          url: "route-url-1",
          delay: "route-delay-1",
          variants: [],
        },
        {
          id: "route-id-2",
          url: "route-url-2",
          method: ["get"],
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
              method: ["get"],
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
          method: ["get"],
          delay: "route-delay-1",
          variants: ["route-id-1:variant-1", "route-id-1:variant-2"],
        },
      ]);
    });
  });

  describe("getPlainRoutesVariants", () => {
    it("should return routes variants in plain format when using legacy plainResponsePreview property", () => {
      expect(
        getPlainRouteVariants([
          {
            id: "route-1:variant-1",
            routeId: "route-1",
            type: "handler-id-1",
            preview: "response-preview-1",
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            id: "route-2:variant-1",
            routeId: "route-2",
            type: "handler-id-2",
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

    it("should return routes variants in plain format when constructor is v4", () => {
      expect(
        getPlainRouteVariants([
          {
            id: "route-1:variant-1",
            routeId: "route-1",
            type: "handler-id-1",
            preview: "response-preview-1",
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            id: "route-2:variant-1",
            routeId: "route-2",
            type: "handler-id-2",
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
            id: "route-1:variant-1",
            routeId: "route-1",
            type: "handler-id-1",
            delay: "delay-1",
            foo: "foo-1",
          },
          {
            id: "route-2:variant-1",
            routeId: "route-2",
            type: "handler-id-2",
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

  describe("getCollection", () => {
    it("should add an alert if mock contains not valid routeVariants", () => {
      const mock = getCollection({
        collectionDefinition: {
          id: "foo-id",
          routes: ["foo-route:foo-id"],
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

      expect(alerts.flat[0].id).toEqual("foo:variants");
      expect(alerts.flat[0].message).toEqual(
        "Collection with id 'foo-id' is invalid: routeVariant with id 'foo-route:foo-id' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should add an alert if instantiating Mock throws an error", () => {
      sandbox.stub(express, "Router").throws(new Error("Error creating collection"));
      const mock = getCollection({
        collectionDefinition: {
          id: "foo-id",
          routes: ["foo-route:foo-id"],
        },
        collectionsDefinitions: [],
        routeVariants: [
          {
            variantId: "foo-route",
            id: "foo-route:foo-id",
          },
        ],
        getGlobalDelay: () => {
          //do nothing
        },
        alerts,
        logger,
      });

      expect(mock).toEqual(null);

      expect(alerts.flat[0].id).toEqual("foo:process");
      expect(alerts.flat[0].message).toEqual("Error processing collection");
    });
  });
});
