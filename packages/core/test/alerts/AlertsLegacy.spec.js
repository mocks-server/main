/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const { Logger } = require("@mocks-server/logger");

const Alerts = require("../../src/alerts/Alerts");

const AlertsLegacy = require("../../src/alerts/AlertsLegacy");

function removeDeprecatedAlerts(alerts) {
  return alerts.filter((alert) => !alert.context.startsWith("deprecated"));
}

describe("Alerts Legacy", () => {
  let callbacks;
  let sandbox;
  let alertsLegacy;
  let alerts;
  let logger;
  let legacyLogger;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger.prototype, "error");
    sandbox.stub(Logger.prototype, "warn");
    logger = new Logger();
    legacyLogger = logger.namespace("deprecated");
    alerts = new Alerts("alerts", { logger });
    callbacks = {
      alerts,
      logger: legacyLogger,
    };
    alertsLegacy = new AlertsLegacy(callbacks);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("add method", () => {
    it("should add alert to values", async () => {
      alertsLegacy.add("foo", "Foo message");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message",
        },
      ]);
    });

    it("should remove previous added alert if context is the same", async () => {
      alertsLegacy.add("foo", "Foo message 1");
      alertsLegacy.add("foo", "Foo message 2");
      alertsLegacy.add("foo", "Foo message 3");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 3",
        },
      ]);
    });

    it("should keep previously added alerts if context is not the same", async () => {
      alertsLegacy.add("foo1", "Foo message 1");
      alertsLegacy.add("foo2", "Foo message 2");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo1",
          id: "foo1",
          message: "Foo message 1",
        },
        {
          context: "foo2",
          id: "foo2",
          message: "Foo message 2",
        },
      ]);
    });

    it("should trace warn if alert is called without error", async () => {
      alertsLegacy.add("foo", "Foo message");
      expect(logger.warn.calledWith("Foo message")).toEqual(true);
    });
  });

  describe("values getter", () => {
    it("should return alerts added to alerts object formatted in the same way", () => {
      alertsLegacy.add("foo", "Foo message");
      alerts.set("foo-alert", "Foo message 2");
      alerts.collection("foo-collection").set("foo-alert-2", "Foo message 3");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message",
        },
        {
          context: "foo-alert",
          id: "foo-alert",
          message: "Foo message 2",
        },
        {
          context: "foo-collection:foo-alert-2",
          id: "foo-collection:foo-alert-2",
          message: "Foo message 3",
        },
      ]);
    });
  });

  describe("remove method", () => {
    it("should remove alerts starting by same context from values", async () => {
      expect.assertions(2);
      alertsLegacy.add("foo", "Foo message 1");
      alertsLegacy.add("foo:2", "Foo message 2");
      alertsLegacy.add("var", "Var message 1");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          id: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alertsLegacy.remove("foo");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
      ]);
    });

    it("should remove alerts ending with same context", async () => {
      expect.assertions(2);
      alertsLegacy.add("foo", "Foo message 1");
      alertsLegacy.add("foo:2", "Foo message 2");
      alertsLegacy.add("var", "Var message 1");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          id: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alertsLegacy.remove("foo:2");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
      ]);
    });
  });

  describe("rename method", () => {
    it("should rename alerts starting by same context from values", async () => {
      expect.assertions(2);
      alertsLegacy.add("foo", "Foo message 1");
      alertsLegacy.add("foo:2", "Foo message 2");
      alertsLegacy.add("var", "Var message 1");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          id: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alertsLegacy.rename("foo", "testing");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "testing",
          id: "testing",
          message: "Foo message 1",
        },
        {
          context: "testing:2",
          id: "testing:2",
          message: "Foo message 2",
        },
      ]);
    });

    it("should support passing : at the end of contexts", async () => {
      expect.assertions(2);
      alertsLegacy.add("foo:var", "Foo message 1");
      alertsLegacy.add("foo:var:2", "Foo message 2");
      alertsLegacy.add("foo:var:x", "Var message 1");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo:var",
          id: "foo:var",
          message: "Foo message 1",
        },
        {
          context: "foo:var:2",
          id: "foo:var:2",
          message: "Foo message 2",
        },
        {
          context: "foo:var:x",
          id: "foo:var:x",
          message: "Var message 1",
        },
      ]);
      alertsLegacy.rename("foo:", "testing:");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "testing:var",
          id: "testing:var",
          message: "Foo message 1",
        },
        {
          context: "testing:var:2",
          id: "testing:var:2",
          message: "Foo message 2",
        },
        {
          context: "testing:var:x",
          id: "testing:var:x",
          message: "Var message 1",
        },
      ]);
    });

    it("should rename alerts ending by same context from values", async () => {
      expect.assertions(2);
      alertsLegacy.add("foo", "Foo message 1");
      alertsLegacy.add("foo:2", "Foo message 2");
      alertsLegacy.add("var", "Var message 1");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          id: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alertsLegacy.rename("foo:2", "foo:3");
      expect(removeDeprecatedAlerts(alertsLegacy.values)).toEqual([
        {
          context: "foo",
          id: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          id: "var",
          message: "Var message 1",
        },
        {
          context: "foo:3",
          id: "foo:3",
          message: "Foo message 2",
        },
      ]);
    });
  });
});
