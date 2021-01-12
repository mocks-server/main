/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const CoreMocks = require("../Core.mocks.js");
const LoadersMocks = require("../Loaders.mocks");
const FixturesHandler = require("../../../src/mocks-v1/FixturesHandler");
const FixtureHandler = require("../../../src/mocks-v1/FixtureHandler");
const Behaviors = require("../../../src/mocks-v1/Behaviors");

const tracer = require("../../../src/tracer");
const Fixtures = require("../../../src/mocks-v1/Fixtures");

describe("Fixtures", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;
  let loadersMocks;
  let loadersInstance;
  let fixturesHandler;
  let fixtures;
  let callbacks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbacks = {
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
    };
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    loadersMocks = new LoadersMocks();
    loadersInstance = loadersMocks.stubs.instance;
    fixturesHandler = new FixturesHandler();
    fixturesHandler.addHandler(FixtureHandler);
    sandbox.stub(tracer, "debug");
    fixtures = new Fixtures(loadersInstance);
  });

  afterEach(() => {
    sandbox.restore();
    loadersMocks.restore();
    coreMocks.restore();
  });

  describe("addFromBehaviors method", () => {
    let originalContents;
    beforeEach(() => {
      originalContents = loadersInstance.contents;
      loadersInstance.contents.push(loadersInstance.contents[0]._initialFixtures[0]);
    });

    afterEach(() => {
      loadersInstance.contents = originalContents;
    });

    it("should add fixtures existing in behaviors and not existing in fixtures collection", async () => {
      expect.assertions(2);
      const behaviors = new Behaviors(
        loadersInstance,
        coreInstance.settings,
        coreInstance._eventEmitter,
        callbacks
      );
      await fixtures.init(fixturesHandler);
      await fixtures.process();
      expect(fixtures.count).toEqual(1);
      await behaviors.init(fixturesHandler, fixtures);
      await behaviors.process();
      expect(fixtures.count).toEqual(2);
    });
  });

  describe("count getter", () => {
    it("should return 0 if fixtures are not initialized", async () => {
      expect(fixtures.count).toEqual(0);
    });
  });

  describe("collection getter", () => {
    it("should return an empty array if fixtures are not initialized", async () => {
      expect(fixtures.collection).toEqual([]);
    });
  });
});
