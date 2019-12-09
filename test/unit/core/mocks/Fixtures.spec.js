/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const CoreMocks = require("../Core.mocks.js");
const FilesHandlerMocks = require("./FilesHandler.mocks.js");
const FixturesParser = require("../../../../src/mocks/FixturesParser");
const FixtureParser = require("../../../../src/mocks/FixtureParser");
const Behaviors = require("../../../../src/mocks/Behaviors");

const tracer = require("../../../../src/tracer");
const Fixtures = require("../../../../src/mocks/Fixtures");

describe("Fixtures", () => {
  let sandbox;
  let coreMocks;
  let coreInstance;
  let filesHandlerMocks;
  let filesHandlerInstance;
  let fixturesParser;
  let fixtures;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    filesHandlerMocks = new FilesHandlerMocks();
    filesHandlerInstance = filesHandlerMocks.stubs.instance;
    fixturesParser = new FixturesParser();
    fixturesParser.addParser(FixtureParser);
    sandbox.stub(tracer, "debug");
    fixtures = new Fixtures(
      filesHandlerInstance,
      coreInstance.settings,
      coreInstance._eventEmitter
    );
  });

  afterEach(() => {
    sandbox.restore();
    filesHandlerMocks.restore();
    coreMocks.restore();
  });

  describe("when core emits load:files", () => {
    it("should process fixtures again", async () => {
      await fixtures.init(fixturesParser);
      coreInstance._eventEmitter.on.getCall(0).args[1]();
      expect(tracer.debug.getCall(1).args[0]).toEqual("Processing fixtures");
    });
  });

  describe("addFromBehaviors method", () => {
    let originalContents;
    beforeEach(() => {
      originalContents = filesHandlerInstance.contents;
      filesHandlerInstance.contents.push(filesHandlerInstance.contents[0]._initialFixtures[0]);
    });

    afterEach(() => {
      filesHandlerInstance.contents = originalContents;
    });

    it("should add fixtures existing in behaviors and not exiting in fixtures collection", async () => {
      expect.assertions(2);
      const behaviors = new Behaviors(
        filesHandlerInstance,
        coreInstance.settings,
        coreInstance._eventEmitter
      );
      await fixtures.init(fixturesParser);
      await filesHandlerInstance.init();
      expect(fixtures.collection.length).toEqual(1);
      await behaviors.init(fixturesParser, fixtures);
      expect(fixtures.collection.length).toEqual(2);
    });
  });
});
