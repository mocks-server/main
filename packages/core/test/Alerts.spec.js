/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const NestedCollections = require("@mocks-server/nested-collections").default;

const Alerts = require("../src/Alerts");
const tracer = require("../src/tracer");

describe("Loaders", () => {
  let callbacks;
  let sandbox;
  let alerts;
  let nestedCollection;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "warn");
    nestedCollection = new NestedCollections("alerts");
    callbacks = {
      alerts: nestedCollection,
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

  describe("values getter", () => {
    it("should return alerts added to alerts object formatted in the same way", () => {
      alerts.add("foo", "Foo message");
      nestedCollection.set("foo-alert", "Foo message 2");
      nestedCollection.collection("foo-collection").set("foo-alert-2", "Foo message 3");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message",
        },
        {
          context: "foo-alert",
          message: "Foo message 2",
        },
        {
          context: "foo-collection:foo-alert-2",
          message: "Foo message 3",
        },
      ]);
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
          context: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
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

    it("should remove alerts ending with same context", async () => {
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
          context: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alerts.remove("foo:2");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          message: "Var message 1",
        },
      ]);
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
          context: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
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

    it("should support passing : at the end of contexts", async () => {
      expect.assertions(2);
      alerts.add("foo:var", "Foo message 1");
      alerts.add("foo:var:2", "Foo message 2");
      alerts.add("foo:var:x", "Var message 1");
      expect(alerts.values).toEqual([
        {
          context: "foo:var",
          message: "Foo message 1",
        },
        {
          context: "foo:var:2",
          message: "Foo message 2",
        },
        {
          context: "foo:var:x",
          message: "Var message 1",
        },
      ]);
      alerts.rename("foo:", "testing:");
      expect(alerts.values).toEqual([
        {
          context: "testing:var",
          message: "Foo message 1",
        },
        {
          context: "testing:var:2",
          message: "Foo message 2",
        },
        {
          context: "testing:var:x",
          message: "Var message 1",
        },
      ]);
    });

    it("should rename alerts ending by same context from values", async () => {
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
          context: "var",
          message: "Var message 1",
        },
        {
          context: "foo:2",
          message: "Foo message 2",
        },
      ]);
      alerts.rename("foo:2", "foo:3");
      expect(alerts.values).toEqual([
        {
          context: "foo",
          message: "Foo message 1",
        },
        {
          context: "var",
          message: "Var message 1",
        },
        {
          context: "foo:3",
          message: "Foo message 2",
        },
      ]);
    });
  });
});
