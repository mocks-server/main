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
const FilesLoaderMocks = require("../plugins/FilesLoader.mocks");
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
  let filesLoaderMock;
  let filesLoaderInstance;
  let allFixturesMock;
  let allFixturesInstance;
  let fixturesHandler;
  let behaviors;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    filesLoaderMock = new FilesLoaderMocks();
    filesLoaderInstance = filesLoaderMock.stubs.instance;
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
      filesLoaderInstance,
      coreInstance.settings,
      coreInstance._eventEmitter
    );
  });

  afterEach(() => {
    sandbox.restore();
    filesLoaderMock.restore();
    coreMocks.restore();
  });

  describe("when initializated and behaviors are processed", () => {
    it("should set as current the first one behavior found if no behavior is defined", async () => {
      coreInstance.settings.get.withArgs("behavior").returns(undefined);
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.currentName).toEqual("behavior1");
    });

    it("should trace an error if selected behavior is not found in behaviors", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("foo");
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(tracer.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining('Defined behavior "foo" was not found')
      );
    });

    it("should trace an error if a behavior throws an error during inititalization", async () => {
      const originalInitFunc = FilesLoaderMocks.contents[0].init;
      FilesLoaderMocks.contents[0].init = () => Promise.reject(new Error("foo error"));
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      FilesLoaderMocks.contents[0].init = originalInitFunc;
      expect(tracer.debug.getCall(1).args[0]).toEqual(expect.stringContaining("foo error"));
    });
  });

  describe("when initializated with json behavior definitions", () => {
    let originalFilesLoaderContents;
    beforeEach(() => {
      originalFilesLoaderContents = FilesLoaderMocks.contents;
      FilesLoaderMocks.contents = [
        {
          from: "behavior2",
          id: "behavior3",
          fixtures: ["get-user-3"],
        },
        {
          from: "behavior1",
          id: "behavior2",
          fixtures: ["get-user-2"],
        },
        "foo",
        5,
        false,
        {
          id: "get-user-1",
          url: "/api/users/:id",
          method: "GET",
          response: {
            status: 200,
            body: {},
          },
        },
        {
          id: "get-user-2",
          url: "/api/users/:id",
          method: "GET",
          response: {
            status: 200,
            body: {},
          },
        },
        {
          id: "get-user-3",
          url: "/api/users/:id",
          method: "GET",
          response: {
            status: 200,
            body: {},
          },
        },
        {
          id: "behavior1",
          fixtures: ["get-user-1"],
        },
      ];
      filesLoaderMock = new FilesLoaderMocks();
      filesLoaderInstance = filesLoaderMock.stubs.instance;
      behaviors = new Behaviors(
        filesLoaderInstance,
        coreInstance.settings,
        coreInstance._eventEmitter
      );
    });

    afterEach(() => {
      FilesLoaderMocks.contents = originalFilesLoaderContents;
    });

    it("should create behaviors", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.count).toEqual(3);
    });
  });

  describe("when initializated with json behavior definitions containing wrong extend properties", () => {
    let originalFilesLoaderContents;
    beforeEach(() => {
      originalFilesLoaderContents = FilesLoaderMocks.contents;
      FilesLoaderMocks.contents = [
        {
          from: "behavior2",
          id: "behavior3",
          fixtures: ["get-user-3"],
        },
        {
          from: "behavior1",
          id: "behavior2",
          fixtures: ["get-user-2"],
        },
        {
          from: "behavior5",
          id: "behavior5",
          fixtures: ["get-user-1"],
        },
        {
          id: "behavior1",
          fixtures: ["get-user-1"],
        },
      ];
      filesLoaderMock = new FilesLoaderMocks();
      filesLoaderInstance = filesLoaderMock.stubs.instance;
      behaviors = new Behaviors(
        filesLoaderInstance,
        coreInstance.settings,
        coreInstance._eventEmitter
      );
    });

    afterEach(() => {
      FilesLoaderMocks.contents = originalFilesLoaderContents;
    });

    it("should create only behaviors with right definitions", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.count).toEqual(3);
    });
  });

  describe("when initializated with json behavior definitions containing duplicated ids", () => {
    let originalFilesLoaderContents;
    beforeEach(() => {
      originalFilesLoaderContents = FilesLoaderMocks.contents;
      FilesLoaderMocks.contents = [
        {
          id: "behavior1",
          fixtures: ["get-user-3"],
        },
        {
          id: "behavior2",
          fixtures: ["get-user-2"],
        },
        {
          id: "behavior1",
          fixtures: ["get-user-3"],
        },
        {
          id: "behavior2",
          fixtures: ["get-user-2"],
        },
      ];
      filesLoaderMock = new FilesLoaderMocks();
      filesLoaderInstance = filesLoaderMock.stubs.instance;
      behaviors = new Behaviors(
        filesLoaderInstance,
        coreInstance.settings,
        coreInstance._eventEmitter
      );
    });

    afterEach(() => {
      FilesLoaderMocks.contents = originalFilesLoaderContents;
    });

    it("should create behaviors with same id only once", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.count).toEqual(2);
    });
  });

  describe("current setter", () => {
    it("should throw an error if behavior to set is not found in behaviors", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      try {
        behaviors.current = "foo";
      } catch (err) {
        expect(err).toEqual(fooBoomError);
      }
    });

    it("should change the current selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      behaviors.current = "behavior2";
      expect(behaviors.current.id).toEqual("behavior2");
    });
  });

  describe("current getter", () => {
    it("should return the first behavior if current was not set", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.current.id).toEqual("behavior1");
    });

    it("should return an empty behavior if current was not found", async () => {
      filesLoaderInstance.contents = [];
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.current.fixtures.length).toEqual(0);
    });
  });

  describe("count getter", () => {
    it("should return the number of behaviors", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.count).toEqual(2);
    });
  });

  describe("currentTotalFixtures getter", () => {
    it("should return the total number of fixtures of currently selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.currentTotalFixtures).toEqual(behaviors.current.fixtures.length);
    });
  });

  describe("currentFromCollection getter", () => {
    it("should return the current selected behavior", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.currentFromCollection.id).toEqual("behavior1");
    });
  });

  describe("all getter", () => {
    it("should return behaviors object", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.all.behavior1.id).toEqual("behavior1");
      expect(behaviors.all.behavior2.id).toEqual("behavior2");
    });
  });

  describe("ids getter", () => {
    it("should return all behaviors ids", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.ids).toEqual(["behavior1", "behavior2"]);
    });
  });

  describe("currentId getter", () => {
    it("should return current behavior id", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("behavior2");
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.currentId).toEqual("behavior2");
    });
  });

  describe("names getter", () => {
    it("should return all behaviors ids", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.names).toEqual(["behavior1", "behavior2"]);
    });
  });

  describe("currentName getter", () => {
    it("should return current behavior id", async () => {
      coreInstance.settings.get.withArgs("behavior").returns("behavior2");
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.currentName).toEqual("behavior2");
    });
  });

  describe("collection getter", () => {
    it("should return all behaviors in collection format", async () => {
      await behaviors.init(fixturesHandler, allFixturesInstance);
      await behaviors.process();
      expect(behaviors.collection.length).toEqual(2);
    });
  });
});
