/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("@hapi/boom");

const CoreMocks = require("../Core.mocks.js");
const FilesHandlerMocks = require("../plugins/FilesLoader.mocks");
const AllFixturesMocks = require("./Fixtures.mocks");
const FixturesHandler = require("../../../src/mocks/FixturesHandler");
const FixtureHandler = require("../../../src/mocks/FixtureHandler");

const Behaviors = require("../../../src/mocks/Behaviors");
const tracer = require("../../../src/tracer");

describe("Behaviors", () => {
  const fooBoomError = new Error("foo boom error");
  let sandbox;
  let coreMocks;
  let coreInstance;
  let filesHandlerMock;
  let filesHandlerInstance;
  let allFixturesMock;
  let allFixturesInstance;
  let fixturesHandler;
  let behaviors;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    filesHandlerMock = new FilesHandlerMocks();
    filesHandlerInstance = filesHandlerMock.stubs.instance;
    allFixturesMock = new AllFixturesMocks();
    allFixturesInstance = allFixturesMock.stubs.instance;
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    coreInstance.settings.get.withArgs("behavior").returns("behavior1");
    sandbox.stub(tracer, "warn");
    sandbox.stub(tracer, "silly");
    sandbox.stub(tracer, "debug");
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
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
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.currentName).toEqual("behavior1");
    });

    it("should trace an error if selected behavior is not found in behaviors", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("foo");
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining('Defined behavior "foo" was not found')
      );
    });

    it("should trace an error a behavior throws an error during inititalization", async () => {
      const originalInitFunc = FilesHandlerMocks.contents[0].init;
      FilesHandlerMocks.contents[0].init = () => Promise.reject(new Error("foo error"));
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(tracer.debug.getCall(2).args[0]).toEqual(expect.stringContaining("foo error"));
      FilesHandlerMocks.contents[0].init = originalInitFunc;
    });
  });

  describe("when core emits load:fixtures", () => {
    it("should process behaviors again", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      coreInstance._eventEmitter.on.getCall(0).args[1]();
      expect(tracer.debug.getCall(3).args[0]).toEqual("Processing behaviors");
    });
  });

  describe("when core emits a change:settings event", () => {
    it("should set new behavior as current one if behavior has changed", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      coreInstance._eventEmitter.on.getCall(1).args[1]({
        behavior: "behavior2"
      });
      expect(behaviors.currentName).toEqual("behavior2");
    });

    it("should do nothing if behavior has not changed", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      coreInstance._eventEmitter.on.getCall(1).args[1]({});
      expect(behaviors.currentName).toEqual("behavior1");
    });
  });

  describe("current setter", () => {
    it("should throw an error if behavior to set is not found in behaviors", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      try {
        behaviors.current = "foo";
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });

    it("should change the current selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      behaviors.current = "behavior2";
      expect(behaviors.current.name).toEqual("behavior2");
    });
  });

  describe("current getter", () => {
    it("should return the first behavior if current was not set", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.current.name).toEqual("behavior1");
    });

    it("should return an empty behavior if current was not found", async () => {
      filesHandlerInstance.contents = [];
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.current.fixtures.length).toEqual(0);
    });
  });

  describe("count getter", () => {
    it("should return the number of behaviors", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.count).toEqual(2);
    });
  });

  describe("currentTotalFixtures getter", () => {
    it("should return the total number of fixtures of currently selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.currentTotalFixtures).toEqual(behaviors.current.fixtures.length);
    });
  });

  describe("currentFromCollection getter", () => {
    it("should return the current selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.currentFromCollection.name).toEqual("behavior1");
    });
  });

  describe("all getter", () => {
    it("should return behaviors object", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.all.behavior1.name).toEqual("behavior1");
      expect(behaviors.all.behavior2.name).toEqual("behavior2");
    });
  });

  describe("names getter", () => {
    it("should return all behaviors names", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.names).toEqual(["behavior1", "behavior2"]);
    });
  });

  describe("currentName getter", () => {
    it("should return current behavior name", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("behavior2");
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.currentName).toEqual("behavior2");
    });
  });

  describe("collection getter", () => {
    it("should return all behaviors in collection format", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      expect(behaviors.collection.length).toEqual(2);
    });
  });
});
