/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const tracer = require("../../../../src/tracer");
const FixtureParser = require("../../../../src/mocks/FixtureParser");

const FixturesParser = require("../../../../src/mocks/FixturesParser");

describe("FixturesParser", () => {
  let fixturesParser;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "debug");
    fixturesParser = new FixturesParser();
    fixturesParser.addParser(FixtureParser);
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getCollection method", () => {
    it("should ignore fixtures not recognized by any parser", async () => {
      expect(
        fixturesParser.getCollection([
          {
            foo: "foo"
          }
        ]).length
      ).toEqual(0);
    });

    it("should parse recognized fixtures", async () => {
      const collection = fixturesParser.getCollection([
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

    it("should trace used parser to parse fixtures", async () => {
      fixturesParser.getCollection([
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
        "Creating fixture with parser mocks-server-fixture"
      );
    });
  });
});
