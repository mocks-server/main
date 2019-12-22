/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const FixturesHandler = require("../../../../src/mocks/FixturesHandler");
const FixtureHandler = require("../../../../src/mocks/FixtureHandler");

const FixturesGroup = require("../../../../src/mocks/FixturesGroup");

describe("FixturesGroup", () => {
  const fooFixtures = [
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
    }
  ];
  let fixturesHandler;

  beforeEach(() => {
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
    expect.assertions(1);
  });

  describe("when created", () => {
    it("should reverse provided fixtures order", () => {
      const fixturesGroup = new FixturesGroup(fooFixtures);
      expect(fixturesGroup._fixtures).toEqual([
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
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo"
            }
          }
        }
      ]);
    });

    it("should not thorw if is created without fixtures", async () => {
      const fixturesGroup = new FixturesGroup();
      await fixturesGroup.init(fixturesHandler);
      expect(fixturesGroup.collection.length).toEqual(0);
    });
  });

  describe("collection getter", () => {
    it("should return fixtures collection", async () => {
      const fixturesGroup = new FixturesGroup(fooFixtures);
      await fixturesGroup.init(fixturesHandler);
      expect(fixturesGroup.collection.length).toEqual(2);
    });
  });
});
