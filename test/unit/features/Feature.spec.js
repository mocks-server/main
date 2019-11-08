/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

jest.mock("route-parser");

const routeParser = require("route-parser");

const Feature = require("../../../lib/features/Feature");

describe("Feature", () => {
  const fooFunctionResponse = () => {};
  const fooFeatureData = [
    {
      url: "/api/foo/foo-uri",
      method: "GET",
      response: {
        status: 200,
        body: {
          fooProperty: "foo"
        }
      }
    },
    {
      url: "/api/foo/foo-uri-2",
      method: "POST",
      response: {
        status: 422,
        body: {
          fooProperty2: "foo2"
        }
      }
    },
    {
      url: "/api/foo/foo-uri-3",
      method: "POST",
      response: fooFunctionResponse
    }
  ];

  const fooExtendedData = [
    {
      url: "/api/foo/foo-uri-2",
      method: "POST",
      response: {
        status: 500,
        body: {
          fooPropertyExtended: "foo-extended"
        }
      }
    },
    {
      url: "/api/foo/foo-uri-4",
      method: "POST",
      response: {
        status: 200,
        body: {}
      }
    }
  ];

  beforeEach(() => {
    routeParser.mockImplementation(() => "foo-route-parser");
    expect.assertions(1);
  });

  describe("methods method", () => {
    it("should return an object containing provided fixtures grouped by methods", () => {
      const feature = new Feature(fooFeatureData);
      expect(feature.methods).toEqual({
        GET: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        },
        POST: {
          "/api/foo/foo-uri-2": {
            route: "foo-route-parser",
            response: {
              status: 422,
              body: {
                fooProperty2: "foo2"
              }
            }
          },
          "/api/foo/foo-uri-3": {
            route: "foo-route-parser",
            response: fooFunctionResponse
          }
        }
      });
    });
  });

  describe("fixtures method", () => {
    it("should return an array containing provided fixtures", () => {
      const feature = new Feature(fooFeatureData);
      expect(feature.fixtures).toEqual([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 422,
            body: {
              fooProperty2: "foo2"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-3",
          method: "POST",
          response: "function"
        }
      ]);
    });
  });

  describe("totalFixtures method", () => {
    it("should return the total number of fixtures", () => {
      const feature = new Feature(fooFeatureData);
      expect(feature.totalFixtures).toEqual(3);
    });
  });

  describe("extend method", () => {
    it("should leave original Feature methods without modification", () => {
      const feature = new Feature(fooFeatureData);
      feature.extend(fooExtendedData);
      expect(feature.methods).toEqual({
        GET: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        },
        POST: {
          "/api/foo/foo-uri-2": {
            route: "foo-route-parser",
            response: {
              status: 422,
              body: {
                fooProperty2: "foo2"
              }
            }
          },
          "/api/foo/foo-uri-3": {
            route: "foo-route-parser",
            response: fooFunctionResponse
          }
        }
      });
    });

    it("should leave original Feature fixtures without modification", () => {
      const feature = new Feature(fooFeatureData);
      feature.extend(fooExtendedData);
      expect(feature.fixtures).toEqual([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 422,
            body: {
              fooProperty2: "foo2"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-3",
          method: "POST",
          response: "function"
        }
      ]);
    });

    it("should return a new Feature which methods will be an extension from current", () => {
      const feature = new Feature(fooFeatureData);
      const extendedFeature = feature.extend(fooExtendedData);
      expect(extendedFeature.methods).toEqual({
        GET: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        },
        POST: {
          "/api/foo/foo-uri-2": {
            route: "foo-route-parser",
            response: {
              status: 500,
              body: {
                fooPropertyExtended: "foo-extended"
              }
            }
          },
          "/api/foo/foo-uri-3": {
            route: "foo-route-parser",
            response: fooFunctionResponse
          },
          "/api/foo/foo-uri-4": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {}
            }
          }
        }
      });
    });

    it("should return a new Feature which fixtures will be an extension from current", () => {
      const feature = new Feature(fooFeatureData);
      const extendedFeature = feature.extend(fooExtendedData);
      expect(extendedFeature.fixtures).toEqual([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 422,
            body: {
              fooProperty2: "foo2"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-3",
          method: "POST",
          response: "function"
        },
        {
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 500,
            body: {
              fooPropertyExtended: "foo-extended"
            }
          }
        },
        {
          url: "/api/foo/foo-uri-4",
          method: "POST",
          response: {
            status: 200,
            body: {}
          }
        }
      ]);
    });
  });
});
