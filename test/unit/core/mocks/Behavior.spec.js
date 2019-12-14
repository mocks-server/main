/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const FixturesHandler = require("../../../../src/mocks/FixturesHandler");
const FixtureHandler = require("../../../../src/mocks/FixtureHandler");

const Behavior = require("../../../../src/mocks/Behavior");

describe("Behavior", () => {
  const fooBehaviorData = [
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
      response: {
        status: 500,
        body: {
          foo: "foo"
        }
      }
    }
  ];
  let fixturesHandler;

  beforeEach(() => {
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
    expect.assertions(1);
  });

  describe("when created", () => {
    it("should clone provided fixtures", async () => {
      const clonedBehaviorData = [...fooBehaviorData];
      const behavior = new Behavior(clonedBehaviorData);
      clonedBehaviorData.push({
        url: "/api/foo/foo-uri-2",
        method: "GET",
        response: {
          status: 200,
          body: {}
        }
      });
      const extendedBehavior = behavior.extend([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {}
          }
        }
      ]);
      await extendedBehavior.init(fixturesHandler);
      expect(extendedBehavior.fixtures.length).toEqual(4);
    });

    it("should be able to create empty behavior", async () => {
      const behavior = new Behavior();
      await behavior.init(fixturesHandler);
      expect(behavior.fixtures.length).toEqual(0);
    });
  });

  describe("fixtures getter", () => {
    it("should return current fixtures group collection", async () => {
      const behavior = new Behavior(fooBehaviorData);
      await behavior.init(fixturesHandler);
      expect(behavior.fixtures.length).toEqual(3);
    });
  });

  describe("getRequestMatchingFixture", () => {
    it("should return fixture matching provided request", async () => {
      const behavior = new Behavior(fooBehaviorData);
      await behavior.init(fixturesHandler);
      expect(
        behavior.getRequestMatchingFixture({
          method: "GET",
          url: "/api/foo/foo-uri"
        })._url
      ).toEqual("/api/foo/foo-uri");
    });
  });

  describe("isMocksServerBehavior getter", () => {
    it("should return true", async () => {
      const behavior = new Behavior(fooBehaviorData);
      expect(behavior.isMocksServerBehavior).toEqual(true);
    });
  });

  describe("name getter", () => {
    it("should return name", async () => {
      const behavior = new Behavior(fooBehaviorData);
      behavior.name = "foo";
      expect(behavior.name).toEqual("foo");
    });
  });

  describe("extend method", () => {
    it("should leave original Behavior fixtures without modification", async () => {
      const behavior = new Behavior(fooBehaviorData);
      const extendedBehavior = behavior.extend([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {}
          }
        }
      ]);
      await behavior.init(fixturesHandler);
      await extendedBehavior.init(fixturesHandler);
      expect(behavior.fixtures.length).toEqual(3);
    });

    it("should return a new Behavior which fixtures will be an extension from current", async () => {
      const behavior = new Behavior(fooBehaviorData);
      const extendedBehavior = behavior.extend([
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {}
          }
        }
      ]);
      await extendedBehavior.init(fixturesHandler);
      expect(extendedBehavior.fixtures.length).toEqual(4);
    });
  });
});
