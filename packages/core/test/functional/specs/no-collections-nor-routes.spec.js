/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, findAlert, removeConfigFile } = require("../support/helpers");

describe("collection.selected setting when there are no collections", () => {
  let core, changeCollection;

  beforeAll(async () => {
    core = await startCore("empty");
    await waitForServer();
    changeCollection = (name) => {
      core.config.namespace("mock").namespace("collections").option("selected").value = name;
    };
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("when loaded", () => {
    it("should have added an alert about no selected collection", () => {
      expect(findAlert("mock:collections:selected", core.alerts.flat).message).toEqual(
        expect.stringContaining("Option 'mock.collections.selected' was not defined")
      );
    });

    it("should have added an alert about no collections found", () => {
      expect(findAlert("mock:collections:empty", core.alerts.flat).message).toEqual(
        expect.stringContaining("No collections found")
      );
    });
  });

  describe('when changing collection to "foo"', () => {
    beforeAll(() => {
      changeCollection("foo");
    });

    it("should have removed alert about no collection selected", () => {
      expect(findAlert("mock:collections:selected", core.alerts.flat)).toEqual(undefined);
    });

    it("should have not removed alert about no collections found", () => {
      expect(findAlert("mock:collections:empty", core.alerts.flat).message).toEqual(
        expect.stringContaining("No collections found")
      );
    });
  });
});
