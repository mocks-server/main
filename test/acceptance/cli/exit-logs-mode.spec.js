/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const CliRunner = require("./CliRunner");

const END_SCREEN = "Exit";

describe("when exitLogsMode is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "exit-logs-mode.js");
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

  it('should print selected option as "option1" when user selects "Option 1"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option1"));
  });

  it('should enter in logs mode, exit it after 500ms when user select "Display logs", and continue working normally', async () => {
    expect.assertions(3);
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    let newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Displaying logs"));
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Option 1"));
    newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option1"));
  });
});
