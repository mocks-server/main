/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const CliRunner = require("./support/CliRunner");

const END_SCREEN = "Exit";

describe("when removeListeners is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "remove-listeners.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);
    cliRunner = new CliRunner(cliFile);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Option 1"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Option 1"));
  });

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Exit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Selected option: None"));
  });

  it("should do nothing after removing Listeners even when user tries to select an option", (done) => {
    cliRunner.hasPrinted(END_SCREEN).then(() => {
      setTimeout(async () => {
        try {
          await cliRunner.newScreenAfter(cliRunner.pressEnter);
        } catch (error) {
          expect(error.message).toEqual(expect.stringContaining("No new screen was rendered"));
          done();
        }
      }, 600);
    });
  });
});
