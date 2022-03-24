/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const CoreMocks = require("../Core.mocks.js");

const FixtureHandler = require("../../src/mocks-legacy/FixtureHandler");

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
            status: 200,
          },
        })
      ).toEqual(true);
    });

    it("should return true if fixture is an standard mocks server fixture object with a function as response", () => {
      expect(
        FixtureHandler.recognize({
          url: "foo",
          method: "GET",
          response: () => {
            // do nothing
          },
        })
      ).toEqual(true);
    });

    it("should return false if fixture is not an standard mocks server fixture object", () => {
      expect(
        FixtureHandler.recognize({
          foo: "foo",
        })
      ).toEqual(false);
    });
  });

  describe("requestMatchId getter", () => {
    it("should return unique identifier based on method and url", () => {
      expect.assertions(2);
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      const fixture2 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 300,
          },
        },
        coreInstance
      );
      const fixture3 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "POST",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      expect(fixture.requestMatchId).toEqual(fixture2.requestMatchId);
      expect(fixture.requestMatchId).not.toEqual(fixture3.requestMatchId);
    });
  });

  describe("id getter", () => {
    it("should return unique identifier based on method, url and response", () => {
      expect.assertions(3);
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      const fixture2 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      const fixture3 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 300,
          },
        },
        coreInstance
      );
      const fixture4 = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 300,
          },
        },
        coreInstance
      );
      expect(fixture.id).toEqual(fixture2.id);
      expect(fixture2.id).not.toEqual(fixture3.id);
      expect(fixture3.id).toEqual(fixture4.id);
    });
  });

  describe("request getter", () => {
    it("should return an object containing url and method", () => {
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      expect(fixture.request).toEqual({
        url: "foo/:id",
        method: "GET",
      });
    });
  });

  describe("response getter", () => {
    it("should return an object containing response type and response details", () => {
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
            body: {
              foo: "foo",
            },
          },
        },
        coreInstance
      );
      expect(fixture.response).toEqual({
        type: "static",
        status: 200,
        body: {
          foo: "foo",
        },
      });
    });

    it("should return an object containing response type and response function stringified", () => {
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: () => {
            // do nothing
          },
        },
        coreInstance
      );
      expect(fixture.response).toEqual({
        type: "dynamic",
        function: expect.stringContaining("() => {"),
      });
    });
  });

  describe("requestMatch method", () => {
    it("should return url params if provided request match", async () => {
      const fixture = new FixtureHandler(
        {
          url: "foo/:id",
          method: "GET",
          response: {
            status: 200,
          },
        },
        coreInstance
      );
      expect(
        fixture.requestMatch({
          method: "GET",
          url: "foo/5",
        })
      ).toEqual({
        id: "5",
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
          response: fooResponseMethod,
        },
        coreInstance
      );
      const fooRequest = {
        url: "foo/5",
      };
      const fooNext = sandbox.spy();
      const fooResponse = {
        status: sandbox.spy(),
        send: sandbox.spy(),
      };
      fixture.handleRequest(fooRequest, fooResponse, fooNext, coreInstance);

      expect(fooRequest.params).toEqual({
        id: "5",
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
              "foo-body": "foo",
            },
          },
        },
        coreInstance
      );
      const fooRequest = {
        url: "foo/5",
      };
      const fooNext = sandbox.spy();
      const fooResponse = {
        status: sandbox.spy(),
        send: sandbox.spy(),
      };
      fixture.handleRequest(fooRequest, fooResponse, fooNext, coreInstance);

      expect(fooResponse.status.getCall(0).args[0]).toEqual(200);
      expect(fooResponse.send.getCall(0).args[0]).toEqual({
        "foo-body": "foo",
      });
    });
  });
});
