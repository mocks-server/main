/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("boom");
const { cloneDeep } = require("lodash");

jest.mock("require-all");

const requireAll = require("require-all");

const Behaviors = require("../../../lib/core/Behaviors");

describe("Behaviors", () => {
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

  const fooBehaviorsFiles = {
    file1: {
      behavior1: {
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
      behavior2: {
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
    requireAll.mockImplementation(() => fooBehaviorsFiles);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when instanciated", () => {
    it("should require all files from mocks folders", () => {
      new Behaviors("foo-path", "behavior1", {
        recursive: true
      });
      expect(requireAll).toHaveBeenCalledWith({
        dirname: "foo-path",
        recursive: true
      });
    });

    it("should clean require cache for behaviors folder", () => {
      const fooCachePath = "foo-path";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Behaviors("foo-path", "behavior1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for behaviors folder childs", () => {
      const fooCachePath = "foo-path/foo-children";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Behaviors("foo-path", "behavior1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for behaviors folder childs recursively", () => {
      const fooCachePath = "foo-path/foo-children-2";

      expect(requireCache[fooCachePath]).toBeDefined();
      new Behaviors("foo-path", "behavior1", {
        cache: requireCache
      });
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should throw an error if selected behavior is not found in behaviors", () => {
      try {
        new Behaviors("foo-path", "foo");
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });
  });

  describe("current setter", () => {
    it("should throw an error if behavior to set is not found in behaviors", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      try {
        behaviors.current = "foo";
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });

    it("should change the current selected behavior", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      behaviors.current = "behavior2";
      expect(behaviors.current).toEqual({
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
    it("should return the current selected behavior", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      expect(behaviors.current).toEqual({
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

    it("should return the first behavior if current was not set", () => {
      const behaviors = new Behaviors("foo-path");
      expect(behaviors.current).toEqual({
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

  describe("totalBehaviors getter", () => {
    it("should return the number of behaviors", () => {
      const behaviors = new Behaviors("foo-path");
      expect(behaviors.totalBehaviors).toEqual(2);
    });
  });

  describe("currentTotalFixtures getter", () => {
    it("should return the total number of fixtures of currently selected behavior", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      expect(behaviors.currentTotalFixtures).toEqual(1);
    });
  });

  describe("currentFromCollection getter", () => {
    it("should return the current selected behavior in collection format", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      expect(behaviors.currentFromCollection).toEqual({
        fixtures: [
          {
            method: "GET",
            response: { body: { fooProperty: "foo" }, status: 200 },
            url: "/api/foo/foo-uri"
          }
        ],
        name: "behavior1"
      });
    });
  });

  describe("all getter", () => {
    it("should return all behaviors", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      expect(behaviors.all).toEqual({
        behavior1: {
          POST: {
            "/api/foo/foo-uri": {
              response: { body: { fooProperty: "foo" }, status: 200 },
              route: "foo-route-parser"
            }
          }
        },
        behavior2: {
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
    it("should return all behaviors names", () => {
      const behaviors = new Behaviors("foo-path", "behavior1");
      expect(behaviors.names).toEqual(["behavior1", "behavior2"]);
    });
  });

  describe("currentName getter", () => {
    it("should return current behavior name", () => {
      const behaviors = new Behaviors("foo-path", "behavior2");
      expect(behaviors.currentName).toEqual("behavior2");
    });
  });

  describe("collection getter", () => {
    it("should return all behaviors in collection format", () => {
      const behaviors = new Behaviors("foo-path", "behavior2");
      expect(behaviors.collection).toEqual([
        {
          fixtures: [
            {
              method: "GET",
              response: { body: { fooProperty: "foo" }, status: 200 },
              url: "/api/foo/foo-uri"
            }
          ],
          name: "behavior1"
        },
        {
          fixtures: [
            {
              method: "POST",
              response: { body: { fooProperty2: "foo2" }, status: 422 },
              url: "/api/foo/foo-uri-2"
            }
          ],
          name: "behavior2"
        }
      ]);
    });
  });
});
