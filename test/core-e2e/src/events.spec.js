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
  removeConfigFile,
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
    core = await startCore("web-tutorial", { mocks: { selected: "base" } });
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
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
    let option, removeSpy;

    it("should have emitted event", async () => {
      option = core.config.option("log");
      removeSpy = option.onChange(spies.onChangeSettings);
      option.value = "silly";
      await wait(500);
      expect(spies.onChangeSettings.getCall(0).args[0]).toEqual("silly");
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      option.value = "debug";
      await wait(500);
      expect(spies.onChangeSettings.callCount).toEqual(1);
    });
  });

  describe("When mock is changed", () => {
    let option, removeSpy;

    it("should have emitted event", async () => {
      option = core.config.namespace("files").option("path");
      removeSpy = core.onChangeMocks(spies.onChangeMocks);
      option.value = fixturesFolder("web-tutorial-modified");
      await waitForServerUrl("/api/new-users");
      expect(spies.onChangeMocks.callCount).toEqual(2);
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      option.value = fixturesFolder("web-tutorial");
      await wait(5000);
      expect(spies.onChangeMocks.callCount).toEqual(2);
    });
  });

  describe("When alerts are added", () => {
    let option, removeSpy;

    it("should have emitted event", async () => {
      option = core.config.namespace("mocks").option("selected");
      removeSpy = core.onChangeAlerts(spies.onChangeAlerts);
      option.value = "unexistant";
      await wait(500);
      expect(spies.onChangeAlerts.callCount).toEqual(3);
    });

    it("should not execute callback when event listener is removed", async () => {
      removeSpy();
      option.value = "unexistant2";
      await wait(500);
      expect(spies.onChangeAlerts.callCount).toEqual(3);
    });
  });
});
