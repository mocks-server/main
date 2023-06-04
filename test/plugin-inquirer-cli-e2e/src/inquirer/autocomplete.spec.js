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

const RENDER_TIME_OUT = 5000;
const { wait } = require("../main/support/helpers");

describe("when autocomplete fixture is executed", () => {
  jest.setTimeout(15000);
  const cliFile = path.resolve(__dirname, "fixtures", "autocomplete.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);

    cliRunner = new CliRunner(["node", cliFile]);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Select tags"', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });

    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Select tags"));
  });

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });

    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Exit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });

    expect(cliRunner.logs.current).toEqual(expect.stringContaining("Selected option: None"));
  });

  it('should allow to choose all available tags when "Select tags" is selected', async () => {
    expect.assertions(3);

    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });
    await wait(1000);
    const newScreen = await cliRunner.executeAndWaitUntilNewScreenRendered(
      cliRunner.pressEnter.bind(cliRunner),
      {
        newScreenTimeout: RENDER_TIME_OUT,
      }
    );

    expect(newScreen).toEqual(expect.stringContaining("a-tag"));
    expect(newScreen).toEqual(expect.stringContaining("b-tag"));
    expect(newScreen).toEqual(expect.stringContaining("c-tag"));
  });

  it('should allow to choose only "a-tag" tag when "Select tags" is selected, and "a" is pressed', async () => {
    expect.assertions(3);

    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });
    await wait(1000);
    await cliRunner.executeAndWaitUntilNewScreenRendered(cliRunner.pressEnter.bind(cliRunner), {
      newScreenTimeout: RENDER_TIME_OUT,
    });
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("a");
      },
      "a-tag",
      { timeout: RENDER_TIME_OUT }
    );
    cliRunner.logs.flushCurrent();
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("-");
      },
      "a-tag",
      { timeout: RENDER_TIME_OUT }
    );

    expect(cliRunner.logs.current).toEqual(expect.stringContaining("a-tag"));
    expect(cliRunner.logs.current).not.toEqual(expect.stringContaining("b-tag"));
    expect(cliRunner.logs.current).not.toEqual(expect.stringContaining("c-tag"));
  });

  it('should print selected option as "a-tag" when a-tag is selected in autocomplete', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });
    await wait(1000);
    await cliRunner.executeAndWaitUntilNewScreenRendered(cliRunner.pressEnter.bind(cliRunner), {
      newScreenTimeout: RENDER_TIME_OUT,
    });
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("a");
      },
      "a-tag",
      { timeout: RENDER_TIME_OUT }
    );
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("-");
      },
      "a-tag",
      { timeout: RENDER_TIME_OUT }
    );
    await wait(1000);
    const newScreen = await cliRunner.executeAndWaitUntilNewScreenRendered(
      cliRunner.pressEnter.bind(cliRunner),
      {
        newScreenTimeout: RENDER_TIME_OUT,
      }
    );

    expect(newScreen).toEqual(expect.stringContaining("Selected option: a-tag"));
  });

  it('should print selected option as "c-tag" when c-tag is selected in autocomplete', async () => {
    await cliRunner.waitUntilHasLogged(END_SCREEN, { timeout: RENDER_TIME_OUT });
    await wait(1000);
    await cliRunner.executeAndWaitUntilNewScreenRendered(cliRunner.pressEnter.bind(cliRunner), {
      newScreenTimeout: RENDER_TIME_OUT,
    });
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("c");
      },
      "c-tag",
      { timeout: RENDER_TIME_OUT }
    );
    await cliRunner.executeAndWaitUntilHasLogged(
      () => {
        cliRunner.write("-");
      },
      "c-tag",
      { timeout: RENDER_TIME_OUT }
    );
    await wait(1000);
    const newScreen = await cliRunner.executeAndWaitUntilNewScreenRendered(
      cliRunner.pressEnter.bind(cliRunner),
      {
        newScreenTimeout: RENDER_TIME_OUT,
      }
    );

    expect(newScreen).toEqual(expect.stringContaining("Selected option: c-tag"));
  });
});
