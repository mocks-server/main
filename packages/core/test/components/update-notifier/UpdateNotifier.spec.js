/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const packageJson = require("../../../package.json");
jest.mock("update-notifier");

const { Logger } = require("@mocks-server/logger");
const updateNotifier = require("update-notifier");
const { UpdateNotifier } = require("../../../src/update-notifier/UpdateNotifier");
const { Alerts } = require("../../../src/alerts/Alerts");

describe("UpdateNotifier", () => {
  let sandbox, alerts, logger, updateNotifierMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    updateNotifierMock = {
      notify: sandbox.stub(),
      update: {
        latest: "foo-version",
      },
    };
    logger = new Logger();
    alerts = new Alerts("update-notifier", { logger });

    updateNotifier.mockImplementation(() => updateNotifierMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("id", () => {
    it("should return module id", () => {
      expect(UpdateNotifier.id).toEqual("update-notifier");
    });
  });

  describe("constructor", () => {
    it("should pass package data to notifier if no pkg is received", () => {
      const notifier = new UpdateNotifier({ alerts });
      notifier.init();
      expect(updateNotifier).toHaveBeenCalledWith({
        pkg: packageJson,
        shouldNotifyInNpmScript: true,
      });
    });

    it("should pass pkg data to notifier if received", () => {
      const notifier = new UpdateNotifier({ alerts, pkg: { name: "foo-name" } });
      notifier.init();
      expect(updateNotifier).toHaveBeenCalledWith({
        pkg: { name: "foo-name" },
        shouldNotifyInNpmScript: true,
      });
    });
  });

  describe("init method", () => {
    it("should execute notifier notify method", () => {
      const notifier = new UpdateNotifier({ alerts });
      notifier.init();
      expect(updateNotifierMock.notify.callCount).toEqual(1);
    });

    it("should add an alert if notifier returns update property", () => {
      const notifier = new UpdateNotifier({ alerts });
      notifier.init();
      expect(alerts.flat).toEqual([
        {
          id: "update-notifier:out-of-date",
          error: undefined,
          message: "Update available: @mocks-server/core@foo-version",
        },
      ]);
    });

    it("should not add an alert if notifier does not return update property", () => {
      const notifier = new UpdateNotifier({ alerts });
      updateNotifierMock.update = null;
      notifier.init();
      expect(alerts.flat).toEqual([]);
    });
  });
});
