/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { CliRunner, request, wait, TimeCounter } = require("./utils");

describe("delay argument", () => {
  const binaryPath = "./starter";
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;
  let timeCounter;

  beforeAll(async () => {
    timeCounter = new TimeCounter();
    cli = new CliRunner([binaryPath, "--path=web-tutorial", "--delay=2000"], {
      cwd: cwdPath
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  it("should set delay", async () => {
    expect.assertions(2);
    const users = await request("/api/users");
    timeCounter.stop();
    expect(users).toEqual([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" }
    ]);
    expect(timeCounter.total).toBeGreaterThan(1999);
  });
});
