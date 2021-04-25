/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, findAlert } = require("./support/helpers");

describe("mocks and routes validations", () => {
  let core;
  describe("when files does not export an array", () => {
    beforeAll(async () => {
      core = await startCore("validation-not-array");
      await waitForServer();
    });

    afterAll(async () => {
      await core.stop();
    });

    it("should have added an alert about route file not exporting array", () => {
      expect(findAlert("load:routes:file:", core.alerts).message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have loaded valid routes", () => {
      expect(core.mocks.plainRoutes.length).toEqual(1);
    });

    it("should have added an alert about mocks file loading error", () => {
      expect(findAlert("load:mocks", core.alerts).error.message).toEqual(
        expect.stringContaining("File does not export an array")
      );
    });

    it("should have not loaded mocks", () => {
      expect(core.mocks.plainMocks.length).toEqual(0);
    });
  });
});
