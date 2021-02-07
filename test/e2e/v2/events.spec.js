/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const {
  startCore,
  fetch,
  waitForServer,
  wait,
  fixturesFolder,
  waitForServerUrl,
} = require("./support/helpers");

describe("events", () => {
  let core;
  let sandbox;
  let spies;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    spies = {
      onChangeMocks: sandbox.spy(),
      onChangeSettings: sandbox.spy(),
      onChangeAlerts: sandbox.spy(),
    };
    core = await startCore("web-tutorial", { mock: "base" });
    await waitForServer();
  });

  afterAll(async () => {
    sandbox.restore();
    await core.stop();
  });

  describe("When started", () => {
    it("should load web-tutorial mocks", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When setting is changed", () => {
    let removeSpy;

    it("should have emitted event", async () => {
      removeSpy = core.onChangeSettings(spies.onChangeSettings);
      core.settings.set("log", "silly");
      await wait(500);
      expect(spies.onChangeSettings.getCall(0).args[0]).toEqual({
        log: "silly",
      });
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      core.settings.set("log", "debug");
      await wait(500);
      expect(spies.onChangeSettings.callCount).toEqual(1);
    });
  });

  describe("When mock is changed", () => {
    let removeSpy;

    it("should have emitted event", async () => {
      removeSpy = core.onChangeMocks(spies.onChangeMocks);
      core.settings.set("path", fixturesFolder("web-tutorial-modified"));
      await waitForServerUrl("/api/new-users");
      expect(spies.onChangeMocks.callCount).toEqual(2);
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      core.settings.set("path", fixturesFolder("web-tutorial"));
      await wait(3000);
      expect(spies.onChangeMocks.callCount).toEqual(2);
    });
  });

  describe("When alerts are added", () => {
    let removeSpy;

    it("should have emitted event", async () => {
      removeSpy = core.onChangeAlerts(spies.onChangeAlerts);
      core.settings.set("mock", "unexistant");
      await wait(500);
      expect(spies.onChangeAlerts.callCount).toEqual(1);
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      core.settings.set("mock", "unexistant2");
      await wait(500);
      expect(spies.onChangeAlerts.callCount).toEqual(1);
    });
  });
});
