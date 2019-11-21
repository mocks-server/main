/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("boom");

const FilesHandlerMocks = require("./FilesHandler.mocks.js");
const CoreMocks = require("../Core.mocks.js");

const Behaviors = require("../../../../src/mocks/Behaviors");
const tracer = require("../../../../src/tracer");

describe("Behaviors", () => {
  const fooBoomError = new Error("foo boom error");
  let sandbox;
  let coreMocks;
  let coreInstance;
  let filesHandlerMock;
  let filesHandlerInstance;
  let behaviors;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    filesHandlerMock = new FilesHandlerMocks();
    filesHandlerInstance = filesHandlerMock.stubs.instance;
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    coreInstance.settings.get.withArgs("behavior").returns("behavior1");
    sandbox.stub(tracer, "warn");
    sandbox.stub(tracer, "silly");
    behaviors = new Behaviors(
      filesHandlerInstance,
      coreInstance.settings,
      coreInstance._eventEmitter
    );
  });

  afterEach(() => {
    sandbox.restore();
    filesHandlerMock.restore();
    coreMocks.restore();
  });

  describe("when initializated", () => {
    it("should set as current the first one behavior found if no behavior is defined", async () => {
      coreInstance.settings.get.withArgs("behavior").returns(undefined);
      await behaviors.init();
      expect(behaviors.currentName).toEqual("behavior1");
    });

    it("should trace an error if selected behavior is not found in behaviors", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("foo");
      await behaviors.init();
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining('Defined behavior "foo" was not found')
      );
    });
  });

  describe("when core emits load:mocks", () => {
    it("should process mocks again", async () => {
      await behaviors.init();
      coreInstance._eventEmitter.on.getCall(0).args[1]();
      expect(tracer.silly.callCount).toEqual(2);
    });
  });

  describe("when core emits a change:settings event", () => {
    it("should set new behavior as current one if behavior has changed", async () => {
      await behaviors.init();
      coreInstance._eventEmitter.on.getCall(1).args[1]({
        behavior: "behavior2"
      });
      expect(behaviors.currentName).toEqual("behavior2");
    });

    it("should do nothing if behavior has not changed", async () => {
      await behaviors.init();
      coreInstance._eventEmitter.on.getCall(1).args[1]({});
      expect(behaviors.currentName).toEqual("behavior1");
    });
  });

  describe("current setter", () => {
    it("should throw an error if behavior to set is not found in behaviors", async () => {
      await behaviors.init();
      try {
        behaviors.current = "foo";
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });

    it("should change the current selected behavior", async () => {
      await behaviors.init();
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
    it("should return the current selected behavior", async () => {
      await behaviors.init();
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

    it("should return the first behavior if current was not set", async () => {
      await behaviors.init();
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

  describe("count getter", () => {
    it("should return the number of behaviors", async () => {
      await behaviors.init();
      expect(behaviors.count).toEqual(2);
    });
  });

  describe("currentTotalFixtures getter", () => {
    it("should return the total number of fixtures of currently selected behavior", async () => {
      await behaviors.init();
      expect(behaviors.currentTotalFixtures).toEqual(1);
    });
  });

  describe("currentFromCollection getter", () => {
    it("should return the current selected behavior in collection format", async () => {
      await behaviors.init();
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
    it("should return all behaviors", async () => {
      await behaviors.init();
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
    it("should return all behaviors names", async () => {
      await behaviors.init();
      expect(behaviors.names).toEqual(["behavior1", "behavior2"]);
    });
  });

  describe("currentName getter", () => {
    it("should return current behavior name", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("behavior2");
      await behaviors.init();
      expect(behaviors.currentName).toEqual("behavior2");
    });
  });

  describe("collection getter", () => {
    it("should return all behaviors in collection format", async () => {
      await behaviors.init();
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
