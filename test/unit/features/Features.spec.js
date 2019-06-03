const sinon = require("sinon");
const Boom = require("boom");
const { cloneDeep } = require("lodash");

jest.mock("require-all");

const requireAll = require("require-all");

const Features = require("../../../lib/features/Features");

describe("Features", () => {
  const fooRequireCache = {
    "foo-path": {
      id: "foo-path",
      children: {
        "foo-path/foo-children": {
          id: "foo-path/foo-children"
        }
      }
    },
    "foo-path/foo-children": {
      id: "foo-path/foo-children",
      children: {
        "foo-path/foo-children-2": {
          id: "foo-path/foo-children-2"
        }
      }
    },
    "foo-path/foo-children-2": {
      id: "foo-path/foo-children-2",
      children: {
        "foo-children-3": {
          id: "foo-children-3"
        }
      }
    },
    "foo-not-children": {
      id: "foo-not-children"
    }
  };

  const fooFeaturesFiles = {
    file1: {
      feature1: {
        fixtures: [
          {
            url: "/api/foo/foo-uri",
            method: "GET",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        ],
        totalFixtures: 1,
        methods: {
          POST: {
            "/api/foo/foo-uri": {
              route: "foo-route-parser",
              response: {
                status: 200,
                body: {
                  fooProperty: "foo"
                }
              }
            }
          }
        }
      }
    },
    file2: {
      feature2: {
        fixtures: [
          {
            url: "/api/foo/foo-uri-2",
            method: "POST",
            response: {
              status: 422,
              body: {
                fooProperty2: "foo2"
              }
            }
          }
        ],
        totalFixtures: 1,
        methods: {
          POST: {
            "/api/foo/foo-uri-2": {
              route: "foo-route-parser",
              response: {
                status: 422,
                body: {
                  fooProperty2: "foo2"
                }
              }
            }
          }
        }
      }
    },
    folder: {
      folder2: {
        file: {
          fooProperty: ""
        }
      }
    }
  };

  const fooBoomError = new Error("foo boom error");
  let sandbox;
  let requireCache;

  beforeEach(() => {
    requireCache = cloneDeep(fooRequireCache);
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    requireAll.mockImplementation(() => fooFeaturesFiles);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when instanciated", () => {
    it("should require all files from features folders", () => {
      new Features("foo-path", "feature1", {
        recursive: true
      });
      expect(requireAll).toHaveBeenCalledWith({
        dirname: "foo-path",
        recursive: true
      });
    });

    it("should clean require cache for features folder", () => {
      const fooCachePath = "foo-path";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Features("foo-path", "feature1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for features folder childs", () => {
      const fooCachePath = "foo-path/foo-children";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Features("foo-path", "feature1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for features folder childs recursively", () => {
      const fooCachePath = "foo-path/foo-children-2";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Features("foo-path", "feature1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should throw an error if selected feature is not found in features", () => {
      try {
        new Features("foo-path", "foo");
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });
  });

  describe("current setter", () => {
    it("should throw an error if feature to set is not found in features", () => {
      const features = new Features("foo-path", "feature1");
      try {
        features.current = "foo";
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });

    it("should change the current selected feature", () => {
      const features = new Features("foo-path", "feature1");
      features.current = "feature2";
      expect(features.current).toEqual({
        POST: {
          "/api/foo/foo-uri-2": {
            route: "foo-route-parser",
            response: {
              status: 422,
              body: {
                fooProperty2: "foo2"
              }
            }
          }
        }
      });
    });
  });

  describe("current getter", () => {
    it("should return the current selected feature", () => {
      const features = new Features("foo-path", "feature1");
      expect(features.current).toEqual({
        POST: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        }
      });
    });

    it("should return the first feature if current was not set", () => {
      const features = new Features("foo-path");
      expect(features.current).toEqual({
        POST: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        }
      });
    });
  });

  describe("totalFeatures getter", () => {
    it("should return the number of features", () => {
      const features = new Features("foo-path");
      expect(features.totalFeatures).toEqual(2);
    });
  });

  describe("currentTotalFixtures getter", () => {
    it("should return the total number of fixtures of currently selected feature", () => {
      const features = new Features("foo-path", "feature1");
      expect(features.currentTotalFixtures).toEqual(1);
    });
  });

  describe("currentFromCollection getter", () => {
    it("should return the current selected feature in collection format", () => {
      const features = new Features("foo-path", "feature1");
      expect(features.currentFromCollection).toEqual({
        fixtures: [
          {
            method: "GET",
            response: { body: { fooProperty: "foo" }, status: 200 },
            url: "/api/foo/foo-uri"
          }
        ],
        name: "feature1"
      });
    });
  });

  describe("all getter", () => {
    it("should return all features", () => {
      const features = new Features("foo-path", "feature1");
      expect(features.all).toEqual({
        feature1: {
          POST: {
            "/api/foo/foo-uri": {
              response: { body: { fooProperty: "foo" }, status: 200 },
              route: "foo-route-parser"
            }
          }
        },
        feature2: {
          POST: {
            "/api/foo/foo-uri-2": {
              response: { body: { fooProperty2: "foo2" }, status: 422 },
              route: "foo-route-parser"
            }
          }
        }
      });
    });
  });

  describe("names getter", () => {
    it("should return all features names", () => {
      const features = new Features("foo-path", "feature1");
      expect(features.names).toEqual(["feature1", "feature2"]);
    });
  });

  describe("currentName getter", () => {
    it("should return current feature name", () => {
      const features = new Features("foo-path", "feature2");
      expect(features.currentName).toEqual("feature2");
    });
  });

  describe("collection getter", () => {
    it("should return all features in collection format", () => {
      const features = new Features("foo-path", "feature2");
      expect(features.collection).toEqual([
        {
          fixtures: [
            {
              method: "GET",
              response: { body: { fooProperty: "foo" }, status: 200 },
              url: "/api/foo/foo-uri"
            }
          ],
          name: "feature1"
        },
        {
          fixtures: [
            {
              method: "POST",
              response: { body: { fooProperty2: "foo2" }, status: 422 },
              url: "/api/foo/foo-uri-2"
            }
          ],
          name: "feature2"
        }
      ]);
    });
  });
});
