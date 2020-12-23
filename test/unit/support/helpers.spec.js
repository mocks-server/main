/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const sinon = require("sinon");

const helpers = require("../../../src/support/helpers");

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
    let scopedAlertsMethods;

    beforeEach(() => {
      addAlertsMethod = sandbox.stub();
      removeAlertsMethod = sandbox.stub();
      scopedAlertsMethods = helpers.scopedAlertsMethods(
        "fooContext",
        addAlertsMethod,
        removeAlertsMethod
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
  });
});
