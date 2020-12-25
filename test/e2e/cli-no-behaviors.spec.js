/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, wait, BINARY_PATH } = require("./support/utils");

describe("with no behaviors", () => {
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  it("should print a dash as current behavior", async () => {
    cli = new CliRunner([BINARY_PATH, "--path=no-behaviors"], {
      cwd: cwdPath,
    });
    await wait();
    expect(cli.logs).toEqual(expect.stringContaining("Current behavior: -"));
  });

  it("should print behaviors as 0", async () => {
    cli = new CliRunner([BINARY_PATH, "--path=no-behaviors"], {
      cwd: cwdPath,
    });
    await wait();
    expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 0"));
  });

  it("should print current fixtures as 0", async () => {
    cli = new CliRunner([BINARY_PATH, "--path=no-behaviors"], {
      cwd: cwdPath,
    });
    await wait();
    expect(cli.logs).toEqual(expect.stringContaining("Current fixtures: 0"));
  });
});
