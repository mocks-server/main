/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const helpers = require("../../../lib/common/helpers");

describe("helpers", () => {
  describe("stringToBoolean method", () => {
    it("should return true if value is 'true'", async () => {
      expect(helpers.stringToBoolean("true")).toEqual(true);
    });

    it("should return false if value is 'false'", async () => {
      expect(helpers.stringToBoolean("false")).toEqual(false);
    });

    it("should throw an error if values does not match any of previous", async () => {
      expect.assertions(1);
      try {
        helpers.stringToBoolean("foo");
      } catch (err) {
        expect(err.message).toEqual("Invalid boolean value");
      }
    });
  });
});
