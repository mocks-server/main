/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const CliRunner = require("@mocks-server/cli-runner");

const END_SCREEN = "Exit";

describe("when readme example is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "readme-example.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);
    cliRunner = new CliRunner(["node", cliFile]);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Main option 1" and "Main option 2"', async () => {
    expect.assertions(2);
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Main option 1"));
    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Main option 2"));
  });

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Exit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Selected option: None"));
  });

  it('should print selected option as "option1" when user selects "Main option 1"', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    const newScreen = await cliRunner.executeAndWaitUntilNewScreenRendered(
      cliRunner.pressEnter.bind(cliRunner)
    );
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option1"));
  });

  it('should print selected option as "option2" when user selects "Main option 2"', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    cliRunner.cursorDown();
    const newScreen = await cliRunner.executeAndWaitUntilNewScreenRendered(
      cliRunner.pressEnter.bind(cliRunner)
    );
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option2"));
  });

  it('should exit process when user selects "Exit"', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    cliRunner.cursorDown();
    cliRunner.cursorDown();
    cliRunner.pressEnter();
    await cliRunner.hasExited();
    expect(true).toEqual(true);
  });

  it("should exit process if user press CTRL+C", async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN);
    cliRunner.pressCtrlC();
    await cliRunner.hasExited();
    expect(true).toEqual(true);
  });
});
