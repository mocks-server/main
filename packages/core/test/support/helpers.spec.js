/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const sinon = require("sinon");

const helpers = require("../../src/support/helpers");

describe("helpers", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("scopedAlertsMethods", () => {
    let addAlertsMethod;
    let removeAlertsMethod;
    let renameAlertsMethod;
    let scopedAlertsMethods;

    beforeEach(() => {
      addAlertsMethod = sandbox.stub();
      removeAlertsMethod = sandbox.stub();
      renameAlertsMethod = sandbox.stub();
    });

    describe("when contextScope is static", () => {
      beforeEach(() => {
        scopedAlertsMethods = helpers.scopedAlertsMethods(
          "fooContext",
          addAlertsMethod,
          removeAlertsMethod,
          renameAlertsMethod
        );
      });

      describe("returned addAlert method", () => {
        it("should call to the original one but adding defined scope to the context", () => {
          scopedAlertsMethods.addAlert("foo", "Foo alert message", "foo error");
          expect(addAlertsMethod.getCall(0).args[0]).toEqual("fooContext:foo");
          expect(addAlertsMethod.getCall(0).args[1]).toEqual("Foo alert message");
          expect(addAlertsMethod.getCall(0).args[2]).toEqual("foo error");
        });

        it("should add default context if it is not provided", () => {
          scopedAlertsMethods.addAlert(null, "Foo alert message", "foo error");
          expect(addAlertsMethod.getCall(0).args[0]).toEqual("fooContext:");
        });
      });

      describe("returned removeAlerts method", () => {
        it("should call to the original one but adding defined scope to the context", () => {
          scopedAlertsMethods.removeAlerts("foo");
          expect(removeAlertsMethod.getCall(0).args[0]).toEqual("fooContext:foo");
        });

        it("should add default context if it is not provided", () => {
          scopedAlertsMethods.removeAlerts();
          expect(removeAlertsMethod.getCall(0).args[0]).toEqual("fooContext:");
        });
      });

      describe("returned renameAlerts method", () => {
        it("should call to the original one but adding defined scope to the context", () => {
          expect.assertions(2);
          scopedAlertsMethods.renameAlerts("foo", "foo2");
          expect(renameAlertsMethod.getCall(0).args[0]).toEqual("fooContext:foo");
          expect(renameAlertsMethod.getCall(0).args[1]).toEqual("fooContext:foo2");
        });
      });
    });

    describe("when contextScope is a callback", () => {
      let contextToReturn;
      beforeEach(() => {
        contextToReturn = "fooContext";
        scopedAlertsMethods = helpers.scopedAlertsMethods(
          () => contextToReturn,
          addAlertsMethod,
          removeAlertsMethod,
          renameAlertsMethod
        );
      });

      describe("returned addAlert method", () => {
        it("should call to the original one but adding defined scope to the context", () => {
          scopedAlertsMethods.addAlert("foo", "Foo alert message", "foo error");
          expect(addAlertsMethod.getCall(0).args[0]).toEqual("fooContext:foo");
          expect(addAlertsMethod.getCall(0).args[1]).toEqual("Foo alert message");
          expect(addAlertsMethod.getCall(0).args[2]).toEqual("foo error");
        });

        it("should add default context if it is not provided", () => {
          scopedAlertsMethods.addAlert(null, "Foo alert message", "foo error");
          expect(addAlertsMethod.getCall(0).args[0]).toEqual("fooContext:");
        });
      });

      describe("returned removeAlerts method", () => {
        it("should call to the original one but adding defined scope to the context", () => {
          scopedAlertsMethods.removeAlerts("foo");
          expect(removeAlertsMethod.getCall(0).args[0]).toEqual("fooContext:foo");
        });

        it("should add default context if it is not provided", () => {
          scopedAlertsMethods.removeAlerts();
          expect(removeAlertsMethod.getCall(0).args[0]).toEqual("fooContext:");
        });
      });

      describe("when returned context changes", () => {
        it("should call to rename previously added alerts", () => {
          expect.assertions(2);
          scopedAlertsMethods.addAlert("foo", "Foo alert message");
          contextToReturn = "fooContext2";
          scopedAlertsMethods.addAlert("var", "Foo var message");
          expect(renameAlertsMethod.getCall(0).args[0]).toEqual("fooContext:");
          expect(renameAlertsMethod.getCall(0).args[1]).toEqual("fooContext2:");
        });

        it("should not call to rename previously added alerts if context is the same", () => {
          scopedAlertsMethods.addAlert("foo", "Foo alert message");
          scopedAlertsMethods.addAlert("foo", "Foo var message");
          expect(renameAlertsMethod.callCount).toEqual(0);
        });
      });
    });
  });
});
