/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { Logger } = require("@mocks-server/logger");

const Alerts = require("../../src/alerts/Alerts");

describe("Alerts", () => {
  let sandbox;
  let alerts;
  let logger;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    logger = new Logger();
    sandbox.stub(Logger.prototype, "error");
    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "debug");
    alerts = new Alerts("alerts", { logger });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("set method", () => {
    it("should add alert to items", async () => {
      alerts.set("foo", "Foo message");
      expect(alerts.flat).toEqual([
        {
          collection: "alerts",
          id: "foo",
          value: {
            message: "Foo message",
          },
        },
      ]);
    });

    it("should add alert to subcollection items", async () => {
      alerts.set("foo", "Foo message");
      alerts.collection("foo-collection").set("foo-2", "Foo message 2");
      expect(alerts.flat).toEqual([
        {
          collection: "alerts",
          id: "foo",
          value: {
            message: "Foo message",
          },
        },
        {
          collection: "alerts:foo-collection",
          id: "foo-2",
          value: {
            message: "Foo message 2",
          },
        },
      ]);
    });

    it("should trace error message if alert is called with it", async () => {
      const FOO_ERROR = new Error("Foo error message");
      FOO_ERROR.stack = "foo-stack";
      alerts.set("foo", "Foo message", FOO_ERROR);
      expect(logger.error.calledWith("Foo message: Foo error message")).toEqual(true);
      expect(logger.debug.calledWith("foo-stack")).toEqual(true);
    });

    it("should trace warn if alert is called without error", async () => {
      alerts.set("foo", "Foo message");
      expect(logger.warn.calledWith("Foo message")).toEqual(true);
    });
  });
});
