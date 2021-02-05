/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { getVariantId, getMockRoutesVariants } = require("../../../src/mocks/helpers");

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
});
