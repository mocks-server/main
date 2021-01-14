/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("@hapi/boom");

const BehaviorsMocks = require("./Behaviors.mocks.js");
const FixturesMocks = require("./Fixtures.mocks.js");
const LoadersMocks = require("../Loaders.mocks");
const CoreMocks = require("../Core.mocks.js");

const Mocks = require("../../../src/mocks-legacy/Mocks");

describe("Behaviors", () => {
  const fooBoomError = new Error("foo boom error");
  let callbacks;
  let sandbox;
  let coreMocks;
  let loadersMocks;
  let behaviorsMocks;
  let fixturesMocks;
  let coreInstance;
  let mocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbacks = {
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
    };
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    loadersMocks = new LoadersMocks();
    behaviorsMocks = new BehaviorsMocks();
    fixturesMocks = new FixturesMocks();
    mocks = new Mocks(
      coreInstance._eventEmitter,
      coreInstance.settings,
      loadersMocks.stubs.instance,
      coreInstance,
      callbacks
    );
  });

  afterEach(() => {
    sandbox.restore();
    loadersMocks.restore();
    behaviorsMocks.restore();
    fixturesMocks.restore();
    coreMocks.restore();
  });

  describe("addFixturesHandler method", () => {
    it("should add Handler to fixturesHandler", async () => {
      mocks.addFixturesHandler({});
      expect(mocks._fixturesHandler._handlers.length).toEqual(2);
    });
  });

  describe("behaviors getter", () => {
    it("should return behaviors", async () => {
      expect(mocks.behaviors).toEqual(behaviorsMocks.stubs.instance);
    });
  });

  describe("fixtures getter", () => {
    it("should return fixtures", async () => {
      await mocks.init();
      expect(mocks.fixtures.collection.length).toEqual(0);
    });
  });

  describe("processLoadedMocks method", () => {
    it("should call to process fixtures and behaviors", async () => {
      expect.assertions(2);
      await mocks.init();
      await mocks.processLoadedMocks();
      expect(behaviorsMocks.stubs.instance.process.callCount).toEqual(1);
      expect(fixturesMocks.stubs.instance.process.callCount).toEqual(1);
    });
  });
});
