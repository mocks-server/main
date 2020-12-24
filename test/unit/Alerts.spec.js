/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const Alerts = require("../../src/Alerts");
const tracer = require("../../src/tracer");

describe("Loaders", () => {
  let callbacks;
  let sandbox;
  let alerts;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "warn");
    callbacks = {
      onChangeValues: sandbox.stub(),
    };
    alerts = new Alerts(callbacks);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("add method", () => {
    it("should add alert to values", async () => {
      alerts.add("foo", "Foo message");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message",
        },
      ]);
    });

    it("should remove previous added alert if context is the same", async () => {
      alerts.add("foo", "Foo message 1");
      alerts.add("foo", "Foo message 2");
      alerts.add("foo", "Foo message 3");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message 3",
        },
      ]);
    });

    it("should keep previously added alerts if context is not the same", async () => {
      alerts.add("foo1", "Foo message 1");
      alerts.add("foo2", "Foo message 2");
      expect(alerts.values).toEqual([
        {
          context: "foo1",
          message: "Foo message 1",
        },
        {
          context: "foo2",
          message: "Foo message 2",
        },
      ]);
    });

    it("should notify that alerts have changed", () => {
      alerts.add("foo", "Foo message");
      expect(callbacks.onChangeValues.getCall(0).args[0]).toEqual([
        {
          context: "foo",
          message: "Foo message",
        },
      ]);
    });

    it("should trace error message if alert is called with it", async () => {
      const FOO_ERROR = new Error("Foo error message");
      alerts.add("foo", "Foo message", FOO_ERROR);
      expect(tracer.error.calledWith("Foo message: Foo error message")).toEqual(true);
    });

    it("should trace warn if alert is called without error", async () => {
      alerts.add("foo", "Foo message");
      expect(tracer.warn.calledWith("Foo message")).toEqual(true);
    });
  });

  describe("remove method", () => {
    it("should remove alerts starting by same context from values", async () => {
      expect.assertions(2);
      alerts.add("foo", "Foo message 1");
      alerts.add("foo:2", "Foo message 2");
      alerts.add("var", "Var message 1");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
        },
        {
          context: "var",
          message: "Var message 1",
        },
      ]);
      alerts.remove("foo");
      expect(alerts.values).toEqual([
        {
          context: "var",
          message: "Var message 1",
        },
      ]);
    });

    it("should notify that alerts have changed if any is removed", () => {
      alerts.add("foo", "Foo message");
      alerts.remove("foo");
      expect(callbacks.onChangeValues.callCount).toEqual(2);
    });

    it("should not notify that alerts have changed if no one is removed", () => {
      alerts.add("foo", "Foo message");
      alerts.remove("var");
      expect(callbacks.onChangeValues.callCount).toEqual(1);
    });
  });

  describe("rename method", () => {
    it("should rename alerts starting by same context from values", async () => {
      expect.assertions(2);
      alerts.add("foo", "Foo message 1");
      alerts.add("foo:2", "Foo message 2");
      alerts.add("var", "Var message 1");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
        },
        {
          context: "var",
          message: "Var message 1",
        },
      ]);
      alerts.rename("foo", "testing");
      expect(alerts.values).toEqual([
        {
          context: "var",
          message: "Var message 1",
        },
        {
          context: "testing",
          message: "Foo message 1",
        },
        {
          context: "testing:2",
          message: "Foo message 2",
        },
      ]);
    });

    it("should notify that alerts have changed if any is renamed", () => {
      alerts.add("foo", "Foo message");
      alerts.rename("foo", "testing");
      expect(callbacks.onChangeValues.callCount).toEqual(2);
    });

    it("should not notify that alerts have changed if no one is renamed", () => {
      alerts.add("foo", "Foo message");
      alerts.rename("var", "testing");
      expect(callbacks.onChangeValues.callCount).toEqual(1);
    });
  });
});
