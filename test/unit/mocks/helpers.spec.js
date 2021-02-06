/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  getVariantId,
  getMockRoutesVariants,
  getPlainMocks,
  getPlainRoutes,
  getPlainRoutesVariants,
  addCustomVariant,
  getIds,
} = require("../../../src/mocks/helpers");

describe("mocks helpers", () => {
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
      expect(getMockRoutesVariants(MOCKS[0], MOCKS, ROUTES_VARIANTS)).toEqual([
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
      expect(getMockRoutesVariants(MOCKS[1], MOCKS, ROUTES_VARIANTS)).toEqual([
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
      expect(getMockRoutesVariants(MOCKS[2], MOCKS, ROUTES_VARIANTS)).toEqual([
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
      expect(getMockRoutesVariants(MOCKS[3], MOCKS, ROUTES_VARIANTS)).toEqual([
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

  describe("getPlainMocks", () => {
    it("should return mocks ids and routeVariants ids", () => {
      expect(
        getPlainMocks([
          {
            id: "mock-id-1",
            routesVariants: [
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
            routesVariants: [
              {
                variantId: "variant-id-3",
              },
            ],
          },
        ])
      ).toEqual([
        {
          id: "mock-id-1",
          routesVariants: ["variant-id-1", "variant-id-2", "variant-id-3"],
        },
        {
          id: "mock-id-2",
          routesVariants: ["variant-id-3"],
        },
      ]);
    });
  });

  describe("getPlainRoutes", () => {
    const ROUTES_VARIANTS = [
      { variantId: "route-id-1:variant-1" },
      { variantId: "route-id-1:variant-2" },
      { variantId: "route-id-2:variant-1" },
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
              delay: "route-delay-2",
              foo: "route-foo-2",
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
              variants: [{ id: "variant-1" }, { id: "variant-2" }, { id: "variant-3" }],
            },
            {
              id: "route-id-2",
              url: "route-url-2",
              method: "route-method-2",
              delay: "route-delay-2",
              foo: "route-foo-2",
              variants: [{ id: "variant-1" }, { id: "variant-2" }],
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
          delay: "route-delay-2",
          variants: ["route-id-2:variant-1"],
        },
      ]);
    });
  });

  describe("getPlainRoutesVariants", () => {
    it("should return routes variants in plain format", () => {
      expect(
        getPlainRoutesVariants([
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

  describe("getIds", () => {
    it("should return array with ids", () => {
      expect(getIds([{ id: "id-1" }, { id: "id-2" }])).toEqual(["id-1", "id-2"]);
    });
  });
});
