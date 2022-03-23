/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  getIds,
  validationSingleMessage,
  compileRouteValidator,
  routeValidationErrors,
  variantValidationErrors,
  mockValidationErrors,
  mockRouteVariantsValidationErrors,
  catchInitValidatorError,
  undoInitValidator,
  restoreValidator,
} = require("../../../src/mocks/validations");
const DefaultRoutesHandler = require("../../../src/routes-handlers/default/DefaultRoutesHandler");

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

  beforeAll(() => {
    catchInitValidatorError();
  });

  describe("validation initialization", () => {
    afterAll(() => {
      restoreValidator();
    });

    describe("catchInitValidatorError", () => {
      it("should return error if there is an error initializating validator", () => {
        undoInitValidator();
        expect(catchInitValidatorError()).toBeInstanceOf(Error);
      });

      it("should do nothing if validator was already inited", () => {
        restoreValidator();
        expect(catchInitValidatorError()).toEqual(null);
      });
    });

    describe("compileRouteValidator", () => {
      it("should initialize a fake routeValidator if there was an error initializating validator", () => {
        undoInitValidator();
        compileRouteValidator();
        expect(
          routeValidationErrors({
            ...VALID_ROUTE,
            id: undefined,
          })
        ).toEqual(null);
      });
    });

    describe("undo init validator", () => {
      it("should not fail if called twice", () => {
        undoInitValidator();
        undoInitValidator();
        expect(
          routeValidationErrors({
            ...VALID_ROUTE,
            id: undefined,
          })
        ).toEqual(null);
      });
    });

    describe("restore validator", () => {
      it("should not fail if called twice", () => {
        restoreValidator();
        restoreValidator();
        expect(catchInitValidatorError()).toEqual(null);
      });
    });
  });

  describe("getIds", () => {
    it("should return array with ids", () => {
      expect(getIds([{ id: "id-1" }, { id: "id-2" }])).toEqual(["id-1", "id-2"]);
    });
  });

  describe("validationSingleMessage", () => {
    it("should return all message properties joined", () => {
      expect(
        validationSingleMessage([
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
        validationSingleMessage([
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
      expect(errors.message).toEqual('Route is invalid: Should have a string property "id"');
      expect(errors.errors.length).toEqual(3);
    });

    it("should return error if route id is not string", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        id: 4,
      });
      expect(errors.message).toEqual(
        'Route with id "4" is invalid: Property "id" should be string'
      );
      expect(errors.errors.length).toEqual(3);
    });

    it("should return error if route url is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        url: 4,
      });
      expect(errors.message).toEqual(
        'Route with id "foo-route" is invalid: Property "url" should be a string or a RegExp'
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
        'Route with id "foo-route" is invalid: Property "method" should be a string or an array with unique items. Allowed values for "method" are "GET,POST,PATCH,DELETE,PUT,OPTIONS,HEAD,TRACE"'
      );
    });

    it("should return error if delay is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        delay: -2,
      });
      expect(errors.message).toEqual(
        'Route with id "foo-route" is invalid: Property "delay" should be a positive integer'
      );
    });

    it("should return error if variants is not valid", () => {
      const errors = routeValidationErrors({
        ...VALID_ROUTE,
        variants: "foo",
      });
      expect(errors.message).toEqual(
        'Route with id "foo-route" is invalid: Property "variants" should be an array'
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
        'Route with id "foo-route" is invalid: Property "id" should be string in variant 0. Property "id" should be string in variant 1'
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
        'Route with id "foo-route" is invalid: Property "handler" should be one of "foo-handler" in variant 0'
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
        'Route with id "foo-route" is invalid: Property "delay" should be a positive integer or "null" in variant 0'
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
        'Route with id "4" is invalid: Property "id" should be string. Property "method" should be a string or an array with unique items. Allowed values for "method" are "GET,POST,PATCH,DELETE,PUT,OPTIONS,HEAD,TRACE". Property "delay" should be a positive integer. Property "id" should be string in variant 0. Property "handler" should be one of "foo-handler" in variant 0. Property "delay" should be a positive integer or "null" in variant 0. Should have a property "url"'
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
    it("should return null if Hanlder has not validationSchema", () => {
      expect(variantValidationErrors({}, {}, {})).toEqual(null);
    });
  });

  describe("variantValidationErrors using DefaultRoutesHandler schema", () => {
    it("should return null if variant is valid", () => {
      expect(
        variantValidationErrors({ id: "foo-route" }, VALID_VARIANT, DefaultRoutesHandler)
      ).toEqual(null);
    });

    it("should return error if variant has not response property", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, id: undefined, response: undefined },
        DefaultRoutesHandler
      );
      expect(errors.message).toEqual(
        'Variant in route with id "foo-route" is invalid: Should have a property "response"'
      );
    });

    it("should return error if variant has not response property", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        { ...VALID_VARIANT, response: undefined },
        DefaultRoutesHandler
      );
      expect(errors.message).toEqual(
        'Variant with id "foo-variant" in route with id "foo-route" is invalid: Should have a property "response"'
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
        DefaultRoutesHandler
      );
      expect(errors.message).toEqual(
        'Variant with id "foo-variant" in route with id "foo-route" is invalid: Property "response.headers" should be an object. Should have an integer property "response.status". Property "response" should be a valid object or a function'
      );
    });

    it("should allow defining variant response as a function", () => {
      const errors = variantValidationErrors(
        { id: "foo-route" },
        {
          ...VALID_VARIANT,
          response: () => {
            // do nothing
          },
        },
        DefaultRoutesHandler
      );
      expect(errors).toEqual(null);
    });
  });

  describe("mockValidationErrors", () => {
    it("should return null if mock is valid", () => {
      expect(
        mockValidationErrors({
          id: "foo",
          from: "foo-base",
          routesVariants: [],
        })
      ).toEqual(null);
    });

    it("should return error if mock has not id", () => {
      const errors = mockValidationErrors({
        routesVariants: [],
      });
      expect(errors.errors.length).toEqual(2);
      expect(errors.message).toEqual('Mock is invalid: Should have a string property "id"');
    });

    it("should return error if mock has not routesVariants", () => {
      const errors = mockValidationErrors({
        id: "foo",
      });
      expect(errors.message).toEqual(
        'Mock with id "foo" is invalid: Should have a property "routesVariants"'
      );
    });

    it("should return all errors together", () => {
      const errors = mockValidationErrors({
        from: 5,
        foo: "foo",
      });
      expect(errors.message).toEqual(
        'Mock is invalid: Extra property "foo" is not allowed. Property "from" should be string. Should have a string property "id". Should have a property "routesVariants"'
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
        mockRouteVariantsValidationErrors(
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
      const errors = mockRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:fake", "foo2:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        'Mock with id "foo" is invalid: routeVariant with id "foo:fake" was not found, use a valid "routeId:variantId" identifier. routeVariant with id "foo2:success" was not found, use a valid "routeId:variantId" identifier'
      );
    });

    it("should return error containing one message for each duplicated route in variants", () => {
      const errors = mockRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:error", "foo:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        'Mock with id "foo" is invalid: route with id "foo" is used more than once in the same mock'
      );
    });

    it("should return all error messages together", () => {
      const errors = mockRouteVariantsValidationErrors(
        {
          id: "foo",
          from: "foo-base",
          routesVariants: ["foo:error", "foo:success", "foo2:success"],
        },
        ROUTE_VARIANTS
      );
      expect(errors.message).toEqual(
        'Mock with id "foo" is invalid: route with id "foo" is used more than once in the same mock. routeVariant with id "foo2:success" was not found, use a valid "routeId:variantId" identifier'
      );
    });

    it("should wotk when no routeVariants are provided in mock", () => {
      const errors = mockRouteVariantsValidationErrors({
        id: "foo",
        from: "foo-base",
      });
      expect(errors).toEqual(null);
    });
  });
});
