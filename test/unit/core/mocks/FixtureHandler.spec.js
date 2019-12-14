/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const CoreMocks = require("../Core.mocks.js");

const FixtureHandler = require("../../../../src/mocks/FixtureHandler");

describe("FixtureHandler", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("recognize static method", () => {
    it("should return true if fixture is an standard mocks server fixture object", () => {
      expect(
        FixtureHandler.recognize({
          url: "foo",
          method: "GET",
          response: {
            status: 200
          }
        })
      ).toEqual(true);
    });

    it("should return true if fixture is an standard mocks server fixture object with a function as response", () => {
      expect(
        FixtureHandler.recognize({
          url: "foo",
          method: "GET",
          response: () => {}
        })
      ).toEqual(true);
    });

    it("should return false if fixture is not an standard mocks server fixture object", () => {
      expect(
        FixtureHandler.recognize({
          foo: "foo"
        })
      ).toEqual(false);
    });
  });

  describe("matchId getter", () => {
    it("should return unique identifier based on method and url", () => {
      expect.assertions(2);
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200
          }
        },
        coreInstance
      );
      const fixture2 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200
          }
        },
        coreInstance
      );
      const fixture3 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "POST",
          response: {
            status: 200
          }
        },
        coreInstance
      );
      expect(fixture.matchId).toEqual(fixture2.matchId);
      expect(fixture.matchId).not.toEqual(fixture3.matchId);
    });
  });

  describe("requestMatch method", () => {
    it("should return url params if provided request match", async () => {
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200
          }
        },
        coreInstance
      );
      expect(
        fixture.requestMatch({
          method: "GET",
          url: "foo/5"
        })
      ).toEqual({
        id: "5"
      });
    });
  });

  describe("handleRequest method", () => {
    it("should execute response with url params if response is a function", async () => {
      expect.assertions(4);
      const fooResponseMethod = sandbox.spy();
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: fooResponseMethod
        },
        coreInstance
      );
      const fooRequest = {
        url: "foo/5"
      };
      const fooNext = sandbox.spy();
      const fooResponse = {
        status: sandbox.spy(),
        send: sandbox.spy()
      };
      fixture.handleRequest(fooRequest, fooResponse, fooNext);

      expect(fooRequest.params).toEqual({
        id: "5"
      });
      expect(fooResponseMethod.getCall(0).args[0]).toEqual(fooRequest);
      expect(fooResponseMethod.getCall(0).args[1]).toEqual(fooResponse);
      expect(fooResponseMethod.getCall(0).args[2]).toEqual(fooNext);
    });

    it("should send response with fixture data if response is not a function", async () => {
      expect.assertions(2);
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
            body: {
              "foo-body": "foo"
            }
          }
        },
        coreInstance
      );
      const fooRequest = {
        url: "foo/5"
      };
      const fooNext = sandbox.spy();
      const fooResponse = {
        status: sandbox.spy(),
        send: sandbox.spy()
      };
      fixture.handleRequest(fooRequest, fooResponse, fooNext);

      expect(fooResponse.status.getCall(0).args[0]).toEqual(200);
      expect(fooResponse.send.getCall(0).args[0]).toEqual({
        "foo-body": "foo"
      });
    });
  });
});
