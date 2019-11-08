/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Settings = require("../../../lib/Settings");

describe("Settings", () => {
  describe("when instantiated", () => {
    describe("options", () => {
      it("should set the delay value", () => {
        const settings = new Settings({
          delay: 3000
        });
        expect(settings.delay).toEqual(3000);
      });
    });

    describe("delay setter", () => {
      it("should set the daly value", () => {
        const settings = new Settings({
          delay: 3000
        });
        settings.delay = 2000;
        expect(settings.delay).toEqual(2000);
      });
    });
  });
});
