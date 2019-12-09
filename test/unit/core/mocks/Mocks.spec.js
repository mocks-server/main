/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Boom = require("boom");

const BehaviorsMocks = require("./Behaviors.mocks.js");
const FilesHandlerMocks = require("./FilesHandler.mocks.js");
const CoreMocks = require("../Core.mocks.js");

const Mocks = require("../../../../src/mocks/Mocks");

describe("Behaviors", () => {
  const fooBoomError = new Error("foo boom error");
  let sandbox;
  let coreMocks;
  let filesHandlerMocks;
  let behaviorsMocks;
  let coreInstance;
  let mocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    filesHandlerMocks = new FilesHandlerMocks();
    behaviorsMocks = new BehaviorsMocks();
    mocks = new Mocks(coreInstance.settings, coreInstance._eventEmitter);
  });

  afterEach(() => {
    sandbox.restore();
    filesHandlerMocks.restore();
    behaviorsMocks.restore();
    coreMocks.restore();
  });

  describe("init method", () => {
    it("should init filesHandler", async () => {
      expect.assertions(2);
      await mocks.init();
      expect(filesHandlerMocks.stubs.instance.init.callCount).toEqual(1);
      expect(behaviorsMocks.stubs.instance.init.callCount).toEqual(1);
    });
  });

  describe("start method", () => {
    it("should start filesHandler", async () => {
      await mocks.start();
      expect(filesHandlerMocks.stubs.instance.start.callCount).toEqual(1);
    });
  });

  describe("stop method", () => {
    it("should stop filesHandler", async () => {
      await mocks.stop();
      expect(filesHandlerMocks.stubs.instance.stop.callCount).toEqual(1);
    });
  });

  describe("behaviors getter", () => {
    it("should return behaviors", async () => {
      expect(mocks.behaviors).toEqual(behaviorsMocks.stubs.instance);
    });
  });
});
