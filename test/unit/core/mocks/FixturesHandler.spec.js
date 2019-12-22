/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const tracer = require("../../../../src/tracer");
const FixtureHandler = require("../../../../src/mocks/FixtureHandler");

const FixturesHandler = require("../../../../src/mocks/FixturesHandler");

describe("FixturesHandler", () => {
  let fixturesHandler;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "debug");
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getCollection method", () => {
    it("should ignore fixtures not recognized by any handler", async () => {
      expect(
        fixturesHandler.getCollection([
          {
            foo: "foo"
          }
        ]).length
      ).toEqual(0);
    });

    it("should parse recognized fixtures", async () => {
      const collection = fixturesHandler.getCollection([
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
      expect(collection.length).toEqual(1);
    });

    it("should not add twice duplicated fixtures", async () => {
      const collection = fixturesHandler.getCollection([
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
      expect(collection.length).toEqual(1);
    });

    it("should trace used handler to handle fixtures", async () => {
      fixturesHandler.getCollection([
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
      expect(tracer.debug.getCall(0).args[0]).toEqual(
        "Creating fixture with handler mocks-server-fixture"
      );
    });
  });

  describe("custom handlers", () => {
    class CustomParser {
      static recognize(fixture) {
        return !!fixture.isCustom;
      }

      static get displayName() {
        return "custom-fixture";
      }

      constructor(fixture) {
        this._id = "foo-id";
        this._fixture = fixture;
      }

      get id() {
        return this._id;
      }
    }

    it("should be used to handle fixtures when recognize them", () => {
      expect.assertions(2);
      fixturesHandler.addHandler(CustomParser);
      const collection = fixturesHandler.getCollection([
        {
          isCustom: true
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
      expect(collection.length).toEqual(2);
      expect(collection[0].id).toEqual("foo-id");
    });
  });
});
