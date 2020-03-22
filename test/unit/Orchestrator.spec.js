/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("./Core.mocks.js");
const ServerMocks = require("./server/Server.mocks.js");
const MocksMock = require("./mocks/Mocks.mocks.js");

const Orchestrator = require("../../src/Orchestrator");

describe("Orchestrator", () => {
  let sandbox;
  let serverMocks;
  let coreMocks;
  let coreInstance;
  let mocksMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    serverMocks = new ServerMocks();
    coreMocks = new CoreMocks();
    mocksMock = new MocksMock();
    coreInstance = coreMocks.stubs.instance;
    new Orchestrator(
      coreInstance._eventEmitter,
      mocksMock.stubs.instance,
      serverMocks.stubs.instance
    );
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    mocksMock.restore();
    coreMocks.restore();
    serverMocks.restore();
  });

  describe("when settings change", () => {
    it("should restart the server when port changes", async () => {
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        port: 4540,
      });
      expect(serverMocks.stubs.instance.restart.callCount).toEqual(1);
    });

    it("should restart the server when host changes", async () => {
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        host: "foo-new-host",
      });
      expect(serverMocks.stubs.instance.restart.callCount).toEqual(1);
    });

    it("should do nothing when no port nor host are changed", async () => {
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        foo: true,
      });
      expect(serverMocks.stubs.instance.restart.callCount).toEqual(0);
    });

    it("should set new behavior as current one if behavior has changed", async () => {
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        behavior: "behavior2",
      });
      expect(mocksMock.stubs.instance.behaviors.current).toEqual("behavior2");
    });
  });

  describe("when core emits load:mocks", () => {
    it("should process fixtures and behaviors again", async () => {
      coreInstance._eventEmitter.on.getCall(1).args[1]();
      expect(mocksMock.stubs.instance.processLoadedMocks.callCount).toEqual(1);
    });
  });
});
