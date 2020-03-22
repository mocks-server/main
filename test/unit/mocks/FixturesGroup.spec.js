/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const FixturesHandler = require("../../../src/mocks/FixturesHandler");
const FixtureHandler = require("../../../src/mocks/FixtureHandler");

const FixturesGroup = require("../../../src/mocks/FixturesGroup");
const tracer = require("../../../src/tracer");

describe("FixturesGroup", () => {
  const fooFixtures = [
    {
      id: "fixture-1",
      url: "/api/foo/foo-uri",
      method: "GET",
      response: {
        status: 200,
        body: {
          fooProperty: "foo",
        },
      },
    },
    {
      id: "fixture-2",
      url: "/api/foo/foo-uri-2",
      method: "POST",
      response: {
        status: 422,
        body: {
          fooProperty2: "foo2",
        },
      },
    },
  ];
  let fixturesHandler;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
    sandbox.stub(tracer, "debug");
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when created", () => {
    it("should reverse provided fixtures order", () => {
      const fixturesGroup = new FixturesGroup(fooFixtures);
      expect(fixturesGroup._fixtures).toEqual([
        {
          id: "fixture-2",
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 422,
            body: {
              fooProperty2: "foo2",
            },
          },
        },
        {
          id: "fixture-1",
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo",
            },
          },
        },
      ]);
    });

    it("should not throw if it is created without fixtures", async () => {
      const fixturesGroup = new FixturesGroup();
      await fixturesGroup.init(fixturesHandler);
      expect(fixturesGroup.collection.length).toEqual(0);
    });
  });

  describe("when initializated", () => {
    it("should convert fixtures ids references to real fixtures from the fixtures collection", async () => {
      const fixturesGroup = new FixturesGroup([
        "fixture-1",
        "fixture-2",
        {
          id: "fixture-3",
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo",
            },
          },
        },
      ]);
      await fixturesGroup.init(fixturesHandler, {
        collection: fooFixtures,
      });
      expect(fixturesGroup.collection.length).toEqual(3);
    });

    it("should trace when a fixture id does not exist", async () => {
      expect.assertions(2);
      const fixturesGroup = new FixturesGroup([
        "fixture-1",
        "fixture-foo",
        {
          id: "fixture-3",
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo",
            },
          },
        },
      ]);
      await fixturesGroup.init(fixturesHandler, {
        collection: fooFixtures,
      });
      expect(
        tracer.debug.calledWith('Fixture with id "fixture-foo" was not found and will be ignored')
      ).toEqual(true);
      expect(fixturesGroup.collection.length).toEqual(2);
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
