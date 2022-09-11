/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  getIds,
  customValidationSingleMessage,
  compileRouteValidator,
  routeValidationErrors,
  variantValidationErrors,
  collectionValidationErrors,
  collectionRouteVariantsValidationErrors,
} = require("../../src/mock/validations");
const JsonRoutesHandler = require("../../src/variant-handlers/handlers/Json");
const MiddlewareRoutesHandler = require("../../src/variant-handlers/handlers/Middleware");

describe("mocks validations", () => {
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

  describe("getIds", () => {
    it("should return array with ids", () => {
      expect(getIds([{ id: "id-1" }, { id: "id-2" }])).toEqual(["id-1", "id-2"]);
    });
  });

  describe("validationSingleMessage", () => {
    it("should return all message properties joined", () => {
      expect(
        customValidationSingleMessage([
          {
            message: "foo",
          },
          {
            message: "foo2",
          },
        ])
      ).toEqual("foo. foo2");
    });

    it("should omit empty messages", () => {
      expect(
        customValidationSingleMessage([
          {
            message: "foo",
          },
          {
            message: "",
          },
          {
            message: "foo3",
          },
        ])
      ).toEqual("foo. foo3");
    });
  });

  describe("routeValidationErrors", () => {
    beforeEach(() => {
      compileRouteValidator([{ id: "foo-handler" }]);
    });

    it("should return null if route is valid", () => {
      expect(routeValidationErrors(VALID_ROUTE)).toEqual(null);
    });

    it("should return error if route has not id", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        id: undefined,
      });
      expect(errors.message).toEqual("Route is invalid:  must have required property 'id'");
      expect(errors.errors.length).toEqual(1);
    });

    it("should return error if route id is not string", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        id: 4,
      });
      expect(errors.message).toEqual("Route with id '4' is invalid: /id: type must be string");
      expect(errors.errors.length).toEqual(1);
    });

    it("should return error if route url is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        url: 4,
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /url: type must be string. /url: instanceof must pass \"instanceof\" keyword validation. /url: oneOf must match exactly one schema in oneOf"
      );
      expect(errors.errors.length).toEqual(3);
    });

    it("should not return error if route url is a Regexp", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        url: /^foo/g,
      });
      expect(errors).toEqual(null);
    });

    it("should return error if method is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        method: "FOO",
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /method: enum must be equal to one of the allowed values. /method: type must be array. /method: oneOf must match exactly one schema in oneOf"
      );
    });

    it("should return error if delay is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        delay: -2,
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /delay: minimum must be >= 0"
      );
    });

    it("should return error if variants is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        variants: "foo",
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /variants: type must be array"
      );
    });

    it("should return error if variant id is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        variants: [
          {
            id: 4,
          },
          {
            id: 2,
          },
        ],
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /variants/0/id: type must be string. /variants/1/id: type must be string"
      );
    });

    it("should return error if variant handler is not defined", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        variants: [
          {
            id: "foo",
            handler: "var",
          },
        ],
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /variants/0/handler must be equal to one of the allowed values: foo-handler"
      );
    });

    it("should return error if variant delay is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        variants: [
          {
            id: "foo",
            handler: "foo-handler",
            delay: -2,
          },
        ],
      });
      expect(errors.message).toEqual(
        "Route with id 'foo-route' is invalid: /variants/0/delay: type must be null. /variants/0/delay: minimum must be >= 0. /variants/0/delay: oneOf must match exactly one schema in oneOf"
      );
    });

    it("should return all errors together", () => {
      const errors = routeValidationErrors({
        id: 4,
        method: "foo",
        delay: -1,
        variants: [
          {
            id: 5,
            handler: "foo",
            delay: -2,
          },
        ],
      });
      expect(errors.message).toEqual(
        "Route with id '4' is invalid:  must have required property 'url'. /id: type must be string. /method: enum must be equal to one of the allowed values. /method: type must be array. /method: oneOf must match exactly one schema in oneOf. /delay: minimum must be >= 0. /variants/0/id: type must be string. /variants/0/delay: type must be null. /variants/0/delay: minimum must be >= 0. /variants/0/delay: oneOf must match exactly one schema in oneOf"
      );
    });
  });

  describe("when adding routeHandlers to routeValidation", () => {
    it("routeValidationErrors should return null if routes uses new handler", () => {
      compileRouteValidator([{ id: "foo-handler" }, { id: "foo-new-handler" }]);
      const errors = routeValidationErrors({
        id: "foo-new-route",
        url: "/foo",
        method: "POST",
        variants: [
          {
            id: "foo-new-variant",
            handler: "foo-new-handler",
          },
        ],
      });
      expect(errors).toEqual(null);
    });
  });

  describe("variantValidationErrors", () => {
    it("should return null if Handler has not validationSchema", () => {
      expect(variantValidationErrors({}, {}, {})).toEqual(null);
    });
  });

  describe("variantValidationErrors using Json handler schema", () => {
    it("should return null if variant is valid", () => {
      expect(
        variantValidationErrors({ id: "foo-route" }, VALID_VARIANT, JsonRoutesHandler)
      ).toEqual(null);
    });

    it("should return error if variant has not response property and it has not id", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, id: undefined, response: undefined },
        JsonRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant in route with id 'foo-route' is invalid: Invalid 'options' property:: type must be object"
      );
    });

    it("should return error if variant has not response property", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, response: undefined },
        JsonRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property:: type must be object"
      );
    });

    it("should return error if variant response headers is not an object", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        {
          ...VALID_VARIANT,
          response: {
            headers: "foo",
          },
        },
        JsonRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property: must have required property 'body'. /headers: type must be object"
      );
    });

    it("should not allow defining variant response as a function", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        {
          ...VALID_VARIANT,
          response: () => {
            // do nothing
          },
        },
        JsonRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property: Wrong type"
      );
    });
  });

  describe("variantValidationErrors using Middleware handler schema", () => {
    const EMPTY_MIDDLEWARE = () => {
      // do nothing
    };

    it("should return null if variant is valid", () => {
      expect(
        variantValidationErrors(
          { id: "foo-route" },
          { ...VALID_VARIANT, response: { middleware: EMPTY_MIDDLEWARE } },
          MiddlewareRoutesHandler
        )
      ).toEqual(null);
    });

    it("should return error if variant has not response property and it has not id", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, id: undefined, response: undefined },
        MiddlewareRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant in route with id 'foo-route' is invalid: Invalid 'options' property:: type must be object"
      );
    });

    it("should return error if variant has not response property", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, response: undefined },
        MiddlewareRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property:: type must be object"
      );
    });

    it("should not allow defining variant response without middleware property", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        VALID_VARIANT,
        MiddlewareRoutesHandler
      );
      expect(errors.message).toEqual(
        "Variant with id 'foo-variant' in route with id 'foo-route' is invalid: Invalid 'options' property: must have required property 'middleware'"
      );
    });
  });

  describe("collectionValidationErrors", () => {
    it("should return null if collection is valid", () => {
      expect(
        collectionValidationErrors({
          id: "foo",
          from: "foo-base",
          routesVariants: [],
        })
      ).toEqual(null);
    });

    it("should return error if collection is undefined", () => {
      const errors = collectionValidationErrors();
      expect(errors.message).toEqual(expect.stringContaining("type must be object"));
      expect(errors.errors.length).toEqual(4);
    });

    it("should return error if mock has not id", () => {
      const errors = collectionValidationErrors({
        routes: [],
      });
      expect(errors.message).toEqual("Collection is invalid:  must have required property 'id'");
      expect(errors.errors.length).toEqual(8);
    });

    it("should return error if mock has not routes", () => {
      const errors = collectionValidationErrors({
        id: "foo",
      });
      expect(errors.message).toEqual(
        "Collection with id 'foo' is invalid:  must have required property 'routes'"
      );
    });

    it("should return all errors together", () => {
      const errors = collectionValidationErrors({
        from: 5,
        foo: "foo",
      });
      expect(errors.message).toEqual(
        "Collection is invalid:  must have required property 'routes'. /from: type must be string,null. /from: type must be string,null. /from: type must be string,null"
      );
    });
  });

  describe("mockRouteVariantsValidationErrors", () => {
    const ROUTE_VARIANTS = [
      {
        routeId: "foo",
        variantId: "foo:success",
      },
      {
        routeId: "foo",
        variantId: "foo:error",
      },
      {
        routeId: "foo2",
        variantId: "foo2:error",
      },
    ];

    it("should return null if all routeVariants exist", () => {
      expect(
        collectionRouteVariantsValidationErrors(
          {
            id: "foo",
            from: "foo-base",
            routesVariants: ["foo:success", "foo2:error"],
          },
          ROUTE_VARIANTS
        )
      ).toEqual(null);
    });

    it("should return error containing one message for each non existant routeVariant", () => {
      const errors = collectionRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:fake", "foo2:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        "Collection with id 'foo' is invalid: routeVariant with id 'foo:fake' was not found, use a valid 'routeId:variantId' identifier. routeVariant with id 'foo2:success' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should return error containing one message for each duplicated route in variants", () => {
      const errors = collectionRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:error", "foo:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        "Collection with id 'foo' is invalid: route with id 'foo' is used more than once in the same collection"
      );
    });

    it("should return all error messages together", () => {
      const errors = collectionRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:error", "foo:success", "foo2:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        "Collection with id 'foo' is invalid: route with id 'foo' is used more than once in the same collection. routeVariant with id 'foo2:success' was not found, use a valid 'routeId:variantId' identifier"
      );
    });

    it("should work when no routeVariants are provided in mock", () => {
      const errors = collectionRouteVariantsValidationErrors({
        id: "foo",
        from: "foo-base",
      });
      expect(errors).toEqual(null);
    });
  });
});
